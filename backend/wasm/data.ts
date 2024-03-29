import {
  Data,
  DataType,
  DataTypeArray,
  DataTypeArrayConstructor,
} from "../types/data.ts";
import { getDataTypeArrayConstructor } from "../util/data.ts";
import { WasmBackend } from "./backend.ts";

export class WasmData<T extends DataType = DataType> implements Data<T> {
  #DataTypeArrayConstructor: DataTypeArrayConstructor<T>;
  #data: DataTypeArray<T>;

  readonly type: T;
  readonly backend: WasmBackend;

  active = true;
  length: number;
  size: number;
  ptr: number;

  get data(): DataTypeArray<T> {
    if (
      this.#data === null || this.#data.buffer !== this.backend.memory.buffer
    ) {
      this.#data = new this.#DataTypeArrayConstructor(
        this.backend.memory.buffer,
        this.ptr,
        this.length,
      ) as DataTypeArray<T>;
    }

    return this.#data;
  }

  static async from<T extends DataType>(
    backend: WasmBackend,
    source: DataTypeArray<T>,
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
    this.#DataTypeArrayConstructor = getDataTypeArrayConstructor(type);

    this.backend = backend;
    this.type = type;
    this.length = length;
    this.size = this.length *
      this.#DataTypeArrayConstructor.BYTES_PER_ELEMENT;

    this.ptr = this.backend.alloc(this.size);
    this.#data = new this.#DataTypeArrayConstructor(
      this.backend.memory.buffer,
      this.ptr,
      this.length,
    ) as DataTypeArray<T>;
  }

  // deno-lint-ignore require-await
  async set(data: DataTypeArray<T>) {
    if (!this.active) {
      throw "WasmData is not active";
    }

    this.data.set(data);
  }

  // deno-lint-ignore require-await
  async get(): Promise<DataTypeArray<T>> {
    if (!this.active) {
      throw "WasmData is not active";
    }

    return this.data.slice() as DataTypeArray<T>;
  }

  dispose(): void {
    if (this.active) {
      this.backend.dealloc(this.ptr, this.size);
      this.active = false;
    }
  }
}
