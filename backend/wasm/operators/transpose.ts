import { ensureType } from "../../util.ts";
import { WasmBackend } from "../backend.ts";
import { WasmData } from "../data.ts";

export async function transpose<T extends "f32" | "u32" | "i32">(
  backend: WasmBackend,
  a: WasmData<T>,
  b: WasmData<T>,
  { w, h }: { w: number; h: number },
) {
  const type = ensureType(a.type, b.type);

  await backend.execute({
    func: `transpose_${type}`,
    args: [w, h],
    data: [a, b],
  });
}
