// TODO: Split this file

import { CoreBackend } from "./core/backend.ts";
import { WasmBackend } from "./wasm/backend.ts";
import { WebGPUBackend } from "./webgpu/backend.ts";
import { WasmData } from "./wasm/data.ts";
import { WebGPUData } from "./webgpu/data.ts";

// TODO: "js" and "native" backends
export type BackendType = "core" | "wasm" | "webgpu";
export type DataPrimitive = "u32" | "i32" | "f32";
export type DataVec = `vec${2 | 3 | 4}<${DataPrimitive}>`;
// export type DataMat = `mat${2 | 3 | 4}<${DataPrimitive}>`;
export type DataType = DataPrimitive | DataVec;
// deno-fmt-ignore
export type DataArray<T extends DataType> =
  T extends "u32" | `vec${2 | 3 | 4}<u32>` ? Uint32Array
  : T extends "i32" | `vec${2 | 3 | 4}<i32>` ? Int32Array
  : T extends "f32" | `vec${2 | 3 | 4}<f32>` ? Float32Array
  : never;
// deno-fmt-ignore
export type DataArrayConstructor<T extends DataType> =
  T extends "u32" | `vec${2 | 3 | 4}<u32>` ? Uint32ArrayConstructor
  : T extends "i32" | `vec${2 | 3 | 4}<i32>` ? Int32ArrayConstructor
  : T extends "f32" | `vec${2 | 3 | 4}<f32>` ? Float32ArrayConstructor
  : never;
export const DataArrayConstructor = {
  "u32": Uint32Array,
  "i32": Int32Array,
  "f32": Float32Array,
} as const;

export interface Data<
  T extends DataType = DataType,
  B extends Backend = Backend,
> {
  type: T;
  backend: B;
  length: number;

  set(data: DataArray<T>): Promise<void>;
  get(): Promise<DataArray<T>>;
  dispose(): void;
}

export interface DataConstructor<
  T extends DataType = DataType,
  B extends Backend = Backend,
> {
  from<T extends DataType>(
    backend: WasmBackend,
    source: DataArray<T>,
    type?: T,
  ): Promise<WasmData<T>>;

  new (): Data<T, B>;
}

export const DataConstructor = {
  "wasm": WasmData,
  "webgpu": WebGPUData,
} as const;

export type GetDataDataType<D> = D extends Data<infer T, infer _> ? T : never;
export type GetDataBackend<D> = D extends Data<infer _, infer B> ? B : never;

export interface BackendConstructor<T extends Backend = Backend> {
  new (): T;
}

// deno-fmt-ignore
export type GetBackendTypeFromBackend<B extends Backend> =
  B extends CoreBackend ? "core"
  : B extends WasmBackend ? "wasm"
  : B extends WebGPUBackend ? "webgpu"
  : never;

// deno-fmt-ignore
export type GetBackendFromBackendType<B extends BackendType> =
  B extends "core" ? CoreBackend
  : B extends "wasm" ? WasmBackend
  : B extends "webgpu" ? WebGPUBackend
  : never;

export interface Backend {
  type: BackendType;
  initalized: boolean;
  supported: boolean;

  initialize(): Promise<void>;
  execute(request: BackendRequest): Promise<void>;
}

export interface BackendRequest<
  T extends DataType = DataType,
  B extends Backend = Backend,
> {
  data: Data<T, B>[];
}

export type BackendOperator<
  B extends Backend = Backend,
  A extends Record<string, unknown> | undefined = undefined,
  D extends Data<DataType, B> = Data<DataType, B>,
> = (backend: B, args: A, ...data: D[]) => Promise<void>;

export type GetBackendOperatorBackend<O> = O extends
  BackendOperator<infer B, infer _, infer _> ? B : never;
export type GetBackendOperatorArgs<O> = O extends
  BackendOperator<infer _, infer A, infer _> ? A : never;
export type GetBackendOperatorData<O> = O extends
  BackendOperator<infer _, infer _, infer D> ? D : never;
