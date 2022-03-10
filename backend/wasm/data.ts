import { Data, DataArray, DataArrayConstructor, DataType } from "../types.ts";
import { WasmBackend } from "./backend.ts";

export class WasmData<T extends DataType = DataType> implements Data<T> {
  type: T;
  backend: WasmBackend;

  length: number;
  size: number;
  buffer: GPUBuffer;

  static async from<T extends DataType>(
    backend: WasmBackend,
    source: DataArray<T>,
    type?: T
  ): Promise<WasmBackend<T>> {
    // deno-fmt-ignore
    type = type ?? (
        source instanceof Uint32Array ? "u32"
      : source instanceof Int32Array ? "i32"
      : source instanceof Float32Array ? "f32"
      : undefined
    ) as T;
    const data = new this(backend, type, source.length);
    await data.set(source);
    return data;
  }

  constructor(
    backend: WasmBackend,
    type: T,
    length: number
  ) {
    this.backend = backend;
    this.type = type;
    this.length = length;
    this.size = this.length *
      DataArrayConstructor[getType(type)].BYTES_PER_ELEMENT;

    this.buffer = this.backend.device.createBuffer({
      size: this.size,
      usage,
    });
  }

  // deno-lint-ignore require-await
  async set(data: DataArray<T>) {
    // const buffer = this.buffer.getMappedRange();
    // const target = new DataArrayConstructor[this.type](buffer);
    // target.set(data);
    // this.buffer.unmap();
    this.backend.device.queue.writeBuffer(this.buffer, 0, data);
  }

  async get(): Promise<DataArray<T>> {
    const staging = this.backend.device.createBuffer({
      size: this.size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    const commandEncoder = this.backend.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(this.buffer, 0, staging, 0, this.size);
    this.backend.device.queue.submit([commandEncoder.finish()]);

    await staging.mapAsync(GPUMapMode.READ);

    return new DataArrayConstructor[getType(this.type)](
      staging.getMappedRange().slice(0),
    ) as DataArray<T>;
  }

  dispose(): void {
    this.buffer.destroy();
  }
}
