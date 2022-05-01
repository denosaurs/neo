import { Data, DataArray, DataArrayConstructor, DataType } from "../types.ts";
import { getType } from "../util.ts";
import { WasmBackend } from "./backend.ts";

export class WasmData<T extends DataType = DataType> implements Data<T> {
  type: T;
  backend: WasmBackend;

  active = true;
  length: number;
  size: number;
  ptr: number;
  data: DataArray<T>;

  static async from<T extends DataType>(
    backend: WasmBackend,
    source: DataArray<T>,
    type?: T
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
    length: number
  ) {
    const Constructor = DataArrayConstructor[getType(type)] as DataArrayConstructor<T>;

    this.backend = backend;
    this.type = type;
    this.length = length;
    this.size = this.length *
    Constructor.BYTES_PER_ELEMENT;

    this.ptr = this.backend.alloc(this.size);
    this.data = new Constructor(this.backend.memory.buffer, this.ptr, this.length) as DataArray<T>;
  }

  // deno-lint-ignore require-await
  async set(data: DataArray<T>) {
    if (!this.active) {
      throw "WasmData is not active";
    }

    this.data.set(data);
  }

  // deno-lint-ignore require-await
  async get(): Promise<DataArray<T>> {
    if (!this.active) {
      throw "WasmData is not active";
    }

    return this.data.slice() as DataArray<T>;
  }

  dispose(): void {
    if (this.active) {
      this.backend.dealloc(this.ptr, this.size);
      this.active = false;
    }
  }
}
