import { DataPrimitive } from "../../types.ts";
import { ensureType } from "../../util.ts";
import { WasmBackend } from "../backend.ts";
import { WasmData } from "../data.ts";

export function binary<T extends DataPrimitive>(func: string) {
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

export const add = binary("add");
export const sub = binary("sub");
export const mul = binary("mul");
export const div = binary("div");
export const mod = binary("mod");
export const min = binary("min");
export const max = binary("max");
export const prelu = binary<"f32" | "i32">("prelu");
