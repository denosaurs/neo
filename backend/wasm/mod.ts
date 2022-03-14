import { source } from "./wasm.js";

export const { instance: { exports } } = await WebAssembly.instantiate(source, {
  env: {
    panic: (ptr: number, len: number) => {
      const msg = decoder.decode(
        new Uint8Array(memory.buffer, ptr, len),
      );
      throw new Error(msg);
    },
  },
});

export const memory = exports.memory as WebAssembly.Memory;
export const alloc = exports.alloc as (size: number) => number;
export const dealloc = exports.dealloc as (
  ptr: number,
  size: number,
) => void;
