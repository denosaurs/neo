import { DataType } from "../../types.ts";
import { ensureType } from "../../util.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import { unary as shader } from "../shaders/unary.ts";

export function unary<T extends DataType>(
  expr: ((type: DataType) => string) | string,
) {
  const exprfn = typeof expr === "string" ? ((_type: DataType) => expr) : expr;

  return async function (
    backend: WebGPUBackend,
    a: WebGPUData<T>,
    b: WebGPUData<T>,
  ) {
    const type = ensureType(a.type, b.type);
    const pipeline = await backend.register(shader(type, exprfn(type)));

    await backend.execute({
      pipeline,
      data: [a, b],
      workgroups: [Math.ceil(a.length / 8)],
    });
  };
}

export const abs = unary("return abs(a);");
export const linear = unary("return a;");
export const neg = unary("return -a;");
export const relu = unary<"f32" | "i32">((type) => `return max(a, 0${type});`);
export const relu6 = unary<"i32">((type) => `return clamp(a, 0${type}, 6${type});`);
export const ceil = unary<"f32">("return ceil(a);");
export const floor = unary<"f32">("return floor(a);");
export const round = unary<"f32">("return round(a);");
export const sqrt = unary<"f32">("return sqrt(a);");
export const rsqrt = unary<"f32">("return 1.0 / sqrt(a);");
export const sigmoid = unary<"f32">("return 1.0 / (1.0 + exp(-1.0 * a));");
export const square = unary<"f32">("return a * a;");
export const cos = unary<"f32">("return cos(a);");
export const cosh = unary<"f32">(`
  let e2x = exp(-a);
  return (e2x + 1.0 / e2x) / 2.0;
`);
export const sin = unary<"f32">("return sin(a);");
export const sinh = unary<"f32">(`
  let e2x = exp(a);
  return (e2x - 1.0 / e2x) / 2.0;
`);
export const tan = unary<"f32">("return tan(a);");
export const tanh = unary<"f32">(`
  let e2x = exp(-2.0 * abs(a));
  return sign(a) * (1.0 - e2x) / (1.0 + e2x);
`);
export const exp = unary<"f32">("return exp(a);");
export const elu = unary<"f32">(`
  if (a >= 0.0) {
    return a;
  } 
  return (exp(a) - 1.0);
`);
export const log = unary<"f32">(`
  if (a < 0.0) {
    return 1.0 / 0.0;
  }
  return log(a);
`);
// export const leakyrelu = unary<"f32" | "i32">((type) => `if (a < 0${type}) { return uniforms.alpha * a; } return a;`);
