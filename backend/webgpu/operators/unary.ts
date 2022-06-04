import { BackendOperator } from "../../types/backend.ts";
import { DataType } from "../../types/data.ts";
import { ensureDataType } from "../../util/data.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import shader from "../shaders/unary.ts";

export function unary<T extends DataType>(
  expr: ((type: DataType) => string) | string,
) {
  const exprfn = typeof expr === "string" ? ((_type: DataType) => expr) : expr;

  return async function (
    backend: WebGPUBackend,
    [a, b]: [WebGPUData<T>, WebGPUData<T>],
  ) {
    const type = ensureDataType(a.type, b.type);
    const pipeline = await backend.register(shader(type, exprfn(type)));

    backend.execute(
      pipeline,
      [128],
      [a, b],
    );
  } as BackendOperator<
    WebGPUBackend,
    [WebGPUData<T>, WebGPUData<T>]
  >;
}

export const abs = unary("return abs(a);");
export const linear = unary("return a;");
export const neg = unary<"f32" | "i32">("return -a;");
export const inc = unary("return a = a + 1;");
export const dec = unary("return a = a - 1;");
export const relu = unary<"f32" | "i32">((type) =>
  `return max(a, ${type}(0));`
);
export const relu6 = unary<"f32" | "i32">((type) =>
  `return clamp(a, ${type}(0), ${type}(6));`
);
export const ceil = unary<"f32">("return ceil(a);");
export const floor = unary<"f32">("return floor(a);");
export const round = unary<"f32">("return round(a);");
export const sqrt = unary<"f32">("return sqrt(a);");
export const rsqrt = unary<"f32">("return 1.0 / sqrt(a);");
export const sigmoid = unary<"f32">("return 1.0 / (1.0 + exp(-1.0 * a));");
export const square = unary<"f32" | "u32" | "i32">("return a * a;");
export const cos = unary<"f32">("return cos(a);");
export const cosh = unary<"f32">(`
  let e2x = exp(-a);
  return (e2x + 1.0 / e2x) / 2.0;
`);
export const selu = unary<"f32">(
  `if (a < 0.0) {
    return 1.67 * (pow(1.67326, a) - 1.0);
   }
   return a;`,
);
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
export const leakyrelu = unary<"f32" | "i32">((type) =>
  `if (a < 0${type}) {
     return  ${type}(f32(a) * 0.01); 
   } 
   return a;`
);
