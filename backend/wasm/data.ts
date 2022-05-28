import { Data, DataType, DataTypeArray } from "../types/data.ts";
import { getDataTypeArrayConstructor } from "../util/data.ts";
import { WasmBackend } from "./backend.ts";

export class WasmData<D extends DataType = DataType> implements Data<D> {
  readonly type: D;
  readonly backend: WasmBackend;

  active = true;
  length: number;
  size: number;
  ptr: number;
  data: DataTypeArray<D>;

  static async from<D extends DataType>(
    backend: WasmBackend,
    source: DataTypeArray<D>,
    type?: D,
  ): Promise<WasmData<D>> {
    // deno-fmt-ignore
    type = type ?? (
        source instanceof Uint32Array ? "u32"
      : source instanceof Int32Array ? "i32"
      : source instanceof Float32Array ? "f32"
      : undefined
    ) as D;
    const data = new this(backend, type, source.length);
    await data.set(source);
    return data;
  }

  constructor(
    backend: WasmBackend,
    type: D,
    length: number,
  ) {
    const DataTypeArrayConstructor = getDataTypeArrayConstructor(type);

    this.backend = backend;
    this.type = type;
    this.length = length;
    this.size = this.length *
      DataTypeArrayConstructor.BYTES_PER_ELEMENT;

    this.ptr = this.backend.alloc(this.size);
    this.data = new DataTypeArrayConstructor(
      this.backend.memory.buffer,
      this.ptr,
      this.length,
    ) as DataTypeArray<D>;
  }

  // deno-lint-ignore require-await
  async set(data: DataTypeArray<D>) {
    if (!this.active) {
      throw "WasmData is not active";
    }

    this.data.set(data);
  }

  // deno-lint-ignore require-await
  async get(): Promise<DataTypeArray<D>> {
    if (!this.active) {
      throw "WasmData is not active";
    }

    return this.data.slice() as DataTypeArray<D>;
  }

  dispose(): void {
    if (this.active) {
      this.backend.dealloc(this.ptr, this.size);
      this.active = false;
    }
  }
}
