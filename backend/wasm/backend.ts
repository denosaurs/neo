import { Backend, BackendRequest, DataType } from "../types.ts";
import { WasmData } from "./data.ts";

const decoder = new TextDecoder();

export interface WasmBackendRequest<T extends DataType = DataType>
  extends BackendRequest<T> {
  func: string;
  args: number[];
  data: WasmData<T>[];
}

export class WasmBackend implements Backend {
  type = "wasm" as const;
  initalized = false;
  supported = true;

  instance!: WebAssembly.Instance;
  memory!: WebAssembly.Memory;

  alloc!: (size: number) => number;
  dealloc!: (ptr: number, size: number) => void;

  async initialize(): Promise<void> {
    if (this.initalized) {
      return;
    }

    const { source } = await import("./wasm.js");
    const { instance: { exports } } = await WebAssembly.instantiate(source, {
      env: {
        panic: (ptr: number, len: number) => {
          const msg = decoder.decode(
            new Uint8Array(this.memory.buffer, ptr, len),
          );
          throw new Error(msg);
        },
      },
    });
    this.memory = exports.memory as WebAssembly.Memory;
    this.alloc = exports.alloc as (size: number) => number;
    this.dealloc = exports.dealloc as (
      ptr: number,
      size: number,
    ) => void;

    this.initalized = true;
  }

  // deno-lint-ignore require-await
  async execute(request: WasmBackendRequest): Promise<void> {
    if (!this.initalized) {
      throw new Error("WasmBackend is not initialized");
    }

    const func = this.instance
      .exports[request.func] as (((...args: unknown[]) => unknown) | undefined);

    if (func === undefined) {
      throw new Error(`Could not find wasm function ${request.func}`);
    }

    const args = request.data.map((data) => data.ptr).concat(request.args);

    func(...args);
  }
}
