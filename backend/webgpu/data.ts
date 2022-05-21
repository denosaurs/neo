import {
  Data,
  DataType,
  DataTypeArray,
  DataTypeArrayConstructor,
} from "../types/data.ts";
import { getDataTypeArrayConstructor } from "../util/data.ts";
import { WebGPUBackend } from "./backend.ts";

export class WebGPUData<T extends DataType = DataType>
  implements Data<T, "webgpu"> {
  #DataTypeArrayConstructor: DataTypeArrayConstructor<T>;

  type: T;
  backend: WebGPUBackend;

  length: number;
  size: number;
  buffer: GPUBuffer;

  static async from<T extends DataType>(
    backend: WebGPUBackend,
    source: DataTypeArray<T>,
    type?: T,
    usage?: number,
  ): Promise<WebGPUData<T>> {
    // deno-fmt-ignore
    type = type ?? (
        source instanceof Uint32Array ? "u32"
      : source instanceof Int32Array ? "i32"
      : source instanceof Float32Array ? "f32"
      : undefined
    ) as T;
    const data = new this(backend, type, source.length, usage);
    await data.set(source);
    return data;
  }

  constructor(
    backend: WebGPUBackend,
    type: T,
    length: number,
    usage: number = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  ) {
    this.#DataTypeArrayConstructor = getDataTypeArrayConstructor(type);

    this.backend = backend;
    this.type = type;
    this.length = length;
    this.size = this.length *
      this.#DataTypeArrayConstructor.BYTES_PER_ELEMENT;

    this.buffer = this.backend.device.createBuffer({
      size: this.size,
      usage,
    });
  }

  // deno-lint-ignore require-await
  async set(data: DataTypeArray<T>) {
    // TODO: Follow upload best practices: https://github.com/toji/webgpu-best-practices/blob/main/buffer-uploads.md
    this.backend.device.queue.writeBuffer(this.buffer, 0, data);
  }

  async get(): Promise<DataTypeArray<T>> {
    const staging = this.backend.device.createBuffer({
      size: this.size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    const commandEncoder = this.backend.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(this.buffer, 0, staging, 0, this.size);
    this.backend.device.queue.submit([commandEncoder.finish()]);

    await staging.mapAsync(GPUMapMode.READ);

    return new this.#DataTypeArrayConstructor(
      staging.getMappedRange().slice(0),
    ) as DataTypeArray<T>;
  }

  dispose(): void {
    this.buffer.destroy();
  }
}
