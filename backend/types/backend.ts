import { Data } from "./data.ts";

export type BackendType = "wasm" | "webgpu";

export interface BackendConstructor<T extends Backend> {
  new (): T;
}

export interface Backend {
  readonly type: BackendType;
  initalized: boolean;
  supported: boolean;
  operators: BackendOperators<this>;

  initialize(): Promise<void>;
}

export type BackendOperators<B extends Backend> = Map<
  string,
  BackendOperators<B>
>;

export type BackendOperator<
  B extends Backend,
  D extends Data[],
  A extends Record<string, unknown> | undefined = undefined,
  R = void,
> = (backend: B, data: D, args: A) => R;
