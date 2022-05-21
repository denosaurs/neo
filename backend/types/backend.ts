import { Data, DataType } from "./data.ts";

export type BackendType = "core" | "wasm" | "webgpu";

export interface BackendConstructor<T extends Backend<BackendType>> {
  new (): T;
}

export interface Backend<B extends BackendType> {
  type: B;
  initalized: boolean;
  supported: boolean;

  initialize(): Promise<void>;
}

export type BackendOperator<
  B extends BackendType,
  D extends DataType,
  A extends Record<string, unknown> | undefined = undefined,
> = (backend: Backend<B>, args: A, ...data: Data<D, B>[]) => Promise<void>;
