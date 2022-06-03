import { BackendOperator } from "../../types/backend.ts";
import { ensureDataType } from "../../util/data.ts";
import { WasmBackend } from "../backend.ts";
import { WasmData } from "../data.ts";

export const transpose: BackendOperator<
  WasmBackend,
  [
    WasmData<"f32" | "u32" | "i32">,
    WasmData<"f32" | "u32" | "i32">,
  ],
  { w: number; h: number }
> = function transpose<T extends "f32" | "u32" | "i32">(
  backend: WasmBackend,
  [a, b]: [WasmData<T>, WasmData<T>],
  { w, h }: { w: number; h: number },
) {
  const type = ensureDataType(a.type, b.type);
  backend.execute(`transpose_${type}`, [w, h, a, b]);
};
