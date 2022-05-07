import { DataType } from "../../types.ts";
import { ensureType } from "../../util.ts";
import { WasmBackend } from "../backend.ts";
import { WasmData } from "../data.ts";

export function binary<T extends DataType>(func: string) {
  return async function (
    backend: WasmBackend,
    a: WasmData<T>,
    b: WasmData<T>,
    c: WasmData<T>,
  ) {
    const type = ensureType(a.type, b.type, c.type);

    await backend.execute({
      func: `${func}_${type}`,
      args: [a.length],
      data: [a, b, c],
    });
  };
}

export const add = binary<"f32" | "u32" | "i32">("add");
export const sub = binary<"f32" | "u32" | "i32">("sub");
export const mul = binary<"f32" | "u32" | "i32">("mul");
export const div = binary<"f32" | "u32" | "i32">("div");
export const mod = binary<"f32" | "u32" | "i32">("mod");
export const min = binary<"f32" | "u32" | "i32">("min");
export const max = binary<"f32" | "u32" | "i32">("max");
export const prelu = binary<"f32" | "i32">("prelu");
