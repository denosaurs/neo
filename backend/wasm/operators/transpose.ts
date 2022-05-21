import { ensureDataType } from "../../util/data.ts";
import { WasmBackend } from "../backend.ts";
import { WasmData } from "../data.ts";

export function transpose<T extends "f32" | "u32" | "i32">(
  backend: WasmBackend,
  a: WasmData<T>,
  b: WasmData<T>,
  { w, h }: { w: number; h: number },
) {
  const type = ensureDataType(a.type, b.type);
  backend.execute(`transpose_${type}`, [w, h, a, b]);
}
