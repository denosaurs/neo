import { ensureDataType } from "../../util/data.ts";
import { WasmBackend } from "../backend.ts";
import { WasmData } from "../data.ts";

export function matmul<T extends "f32" | "u32" | "i32">(
  backend: WasmBackend,
  a: WasmData<T>,
  b: WasmData<T>,
  c: WasmData<T>,
  { m, n, k }: { m: number; n: number; k: number },
) {
  const type = ensureDataType(a.type, b.type, c.type);
  backend.execute(`matmul_${type}`, [m, n, k, a, b, c]);
}
