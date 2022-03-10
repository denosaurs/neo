import { Data, DataArray, DataArrayConstructor, DataType } from "../types.ts";
import { getType } from "../util.ts";
import { WasmBackend } from "./backend.ts";

export class WasmData<T extends DataType = DataType> implements Data<T> {
  type: T;
  backend: WasmBackend;

  length: number;
  size: number;
  data: DataArray<T>;
  pointer: number;

  static async from<T extends DataType>(
    backend: WasmBackend,
    source: DataArray<T>,
    type?: T,
  ): Promise<WasmData<T>> {
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
    length: number,
  ) {
    this.backend = backend;
    this.type = type;
    this.length = length;
    this.size = this.length *
      DataArrayConstructor[getType(type)].BYTES_PER_ELEMENT;
    this.pointer = this.backend.alloc(this.size);
    this.data = new DataArrayConstructor[getType(this.type)](
      this.backend.memory.buffer,
      this.pointer,
      this.length,
    ) as DataArray<T>;
  }

  // deno-lint-ignore require-await
  async set(data: DataArray<T>) {
    this.data.set(data);
  }

  // deno-lint-ignore require-await
  async get(): Promise<DataArray<T>> {
    return this.data.slice() as DataArray<T>;
  }

  dispose(): void {
    this.backend.dealloc(this.pointer, this.size);
  }
}
