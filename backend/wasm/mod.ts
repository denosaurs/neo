import { source } from "./wasm.js";

const decoder = new TextDecoder();

const { instance } = await WebAssembly.instantiate(source, {
  env: {
    panic: (ptr: number, len: number) => {
      const msg = decoder.decode(
        new Uint8Array(memory.buffer, ptr, len),
      );
      throw new Error(msg);
    },
  },
});

export const memory = instance.exports.memory as WebAssembly.Memory;
export const alloc = instance.exports.alloc as (size: number) => number;
export const dealloc = instance.exports.dealloc as (
  ptr: number,
  size: number,
) => void;
