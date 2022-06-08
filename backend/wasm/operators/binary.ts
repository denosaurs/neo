import { BackendOperator } from "../../types/backend.ts";
import { DataType } from "../../types/data.ts";
import { ensureDataType } from "../../util/data.ts";
import { WasmBackend } from "../backend.ts";
import { WasmData } from "../data.ts";

export function binary<T extends DataType>(func: string): BackendOperator<
  WasmBackend,
  [WasmData<T>, WasmData<T>, WasmData<T>]
> {
  return function (
    backend: WasmBackend,
    [a, b, c]: [WasmData<T>, WasmData<T>, WasmData<T>],
  ) {
    const type = ensureDataType(a.type, b.type, c.type);
    backend.execute(`${func}_${type}`, [a.length, a, b, c]);
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
