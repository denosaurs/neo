// import { wasm } from "../../util.ts";
import { Backend, BackendRequest, DataType } from "../types.ts";
import { WasmData } from "./data.ts";

const decoder = new TextDecoder();

export interface WasmBackendRequest<T extends DataType = DataType>
  extends BackendRequest<T> {
  func: string;
  args: (number | bigint)[];
  data: WasmData<T>[];
}

export class WasmBackend implements Backend {
  type = "wasm" as const;
  initalized = false;
  supported = true;

  instance!: WebAssembly.Instance;
  memory!: WebAssembly.Memory;
  alloc!: (size: number) => number;
  dealloc!: (
    pointer: number,
    size: number,
  ) => void;

  async initialize(): Promise<void> {
    if (this.initalized) {
      return;
    }

    const { source } = await import("./wasm.js");
    const { instance } = await WebAssembly.instantiate(source, {
      env: {
        panic: (pointer: number, len: number) => {
          const msg = decoder.decode(
            new Uint8Array(memory.buffer, pointer, len),
          );
          throw new Error(msg);
        },
      },
    });
    const memory = instance.exports.memory as WebAssembly.Memory;

    this.instance = instance;
    this.memory = memory;
    this.alloc = instance.exports.alloc as (size: number) => number;
    this.dealloc = instance.exports.dealloc as (
      pointer: number,
      size: number,
    ) => void;

    this.initalized = true;
  }

  // deno-lint-ignore require-await
  async execute(request: WasmBackendRequest): Promise<void> {
    // deno-lint-ignore no-explicit-any
    (this.instance.exports[request.func] as (...args: any[]) => any)(
      ...request.args,
      ...request.data.map((data) => data.pointer),
    );
  }
}
