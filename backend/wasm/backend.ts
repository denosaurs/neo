import { Backend } from "../types/backend.ts";
import { WasmData } from "./data.ts";

const decoder = new TextDecoder();

export class WasmBackend implements Backend {
  readonly type = "wasm" as const;
  initalized = false;
  supported = true;

  operators = new Map();

  instance!: WebAssembly.Instance;
  memory!: WebAssembly.Memory;

  alloc!: (size: number) => number;
  dealloc!: (ptr: number, size: number) => void;

  async initialize(): Promise<void> {
    if (this.initalized) {
      return;
    }

    const { source } = await import("./wasm.js");
    const { instance } = await WebAssembly.instantiate(source, {
      env: {
        panic: (ptr: number, len: number) => {
          const msg = decoder.decode(
            new Uint8Array(this.memory.buffer, ptr, len),
          );
          throw new Error(msg);
        },
      },
    });
    this.instance = instance;
    this.memory = instance.exports.memory as WebAssembly.Memory;
    this.alloc = instance.exports.alloc as (size: number) => number;
    this.dealloc = instance.exports.dealloc as (
      ptr: number,
      size: number,
    ) => void;

    this.initalized = true;
  }

  execute(name: string, args: (WasmData | number | bigint)[]) {
    if (!this.initalized) {
      throw new Error("WasmBackend is not initialized");
    }

    const func = this.instance.exports[name] as (
      ...args: (number | bigint)[]
    ) => (number | bigint) | undefined;

    if (func === undefined) {
      throw new Error(`Missing wasm export with name of ${name}`);
    }

    return func(...args.map((arg) => arg instanceof WasmData ? arg.ptr : arg));
  }
}
