import { DataType } from "../../types.ts";
import { ensureType } from "../../util.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import { binary as shader } from "../shaders/binary.ts";

export function binary<T extends DataType>(
  expr: ((type: DataType) => string) | string,
) {
  const exprfn = typeof expr === "string" ? ((_type: DataType) => expr) : expr;

  return async function (
    backend: WebGPUBackend,
    a: WebGPUData<T>,
    b: WebGPUData<T>,
    c: WebGPUData<T>,
  ) {
    const type = ensureType(a.type, b.type, c.type);
    const label = `binary_${expr}_${type}`;
    await backend.register(label, shader(type, exprfn(type)));

    await backend.execute({
      pipeline: label,
      data: [a, b, c],
      workgroups: [Math.ceil(a.length / 8)],
    });
  };
}

export const add = binary("return a + b;");
export const sub = binary("return a - b;");
export const mul = binary("return a * b;");
export const div = binary("return a / b;");
export const mod = binary("return a % b;");
export const min = binary("return min(a, b);");
export const max = binary("return max(a, b);");
export const prelu = binary<"f32" | "i32">((type) =>
  `if (a < 0${type}) { return b * a; }  return a;`
);
