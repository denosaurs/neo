import { BackendOperator } from "../../types/backend.ts";
import { ensureDataType } from "../../util/data.ts";
import { WasmBackend } from "../backend.ts";
import { WasmData } from "../data.ts";

export const matmul: BackendOperator<
  WasmBackend,
  [
    WasmData<"f32" | "u32" | "i32">,
    WasmData<"f32" | "u32" | "i32">,
    WasmData<"f32" | "u32" | "i32">,
  ],
  { m: number; n: number; k: number }
> = function matmul<T extends "f32" | "u32" | "i32">(
  backend: WasmBackend,
  [a, b, c]: [WasmData<T>, WasmData<T>, WasmData<T>],
  { m, n, k }: { m: number; n: number; k: number },
) {
  const type = ensureDataType(a.type, b.type, c.type);
  backend.execute(`matmul_${type}`, [m, n, k, a, b, c]);
};
