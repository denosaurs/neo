import { DataType } from "../../types.ts";
import { ensureType } from "../../util.ts";
import { WasmBackend } from "../backend.ts";
import { WasmData } from "../data.ts";

export function unary<T extends DataType>(func: string) {
  return async function (
    backend: WasmBackend,
    a: WasmData<T>,
    b: WasmData<T>,
  ) {
    const type = ensureType(a.type, b.type);

    await backend.execute({
      func: `${func}_${type}`,
      args: [a.length],
      data: [a, b],
    });
  };
}

export const abs = unary<"f32" | "i32">("abs");
export const linear = unary<"f32" | "u32" | "i32">("linear");
export const neg = unary<"f32" | "u32" | "i32">("neg");
export const inc = unary<"f32" | "u32" | "i32">("inc");
export const dec = unary<"f32" | "u32" | "i32">("dec");
export const relu = unary<"f32" | "i32">("relu");
export const relu6 = unary<"f32" | "i32">("relu6");
export const ceil = unary<"f32">("ceil");
export const floor = unary<"f32">("floor");
export const round = unary<"f32">("round");
export const sqrt = unary<"f32">("sqrt");
export const rsqrt = unary<"f32">("rsqrt");
export const sigmoid = unary<"f32">("sigmoid");
export const square = unary<"f32" | "u32" | "i32">("square");
export const cos = unary<"f32">("cos");
export const cosh = unary<"f32">("cosh");
export const sin = unary<"f32">("sin");
export const sinh = unary<"f32">("sinh");
export const tan = unary<"f32">("tan");
export const tanh = unary<"f32">("tanh");
export const exp = unary<"f32">("exp");
export const elu = unary<"f32">("elu");
export const log = unary<"f32">("log");
