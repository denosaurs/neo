import { BackendOperator } from "../../types/backend.ts";
import { DataType } from "../../types/data.ts";
import { ensureDataType } from "../../util/data.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import shader from "../shaders/binary.ts";

export function binary<T extends DataType>(
  expr: ((type: DataType) => string) | string,
): BackendOperator<
  WebGPUBackend,
  [
    WebGPUData<T>,
    WebGPUData<T>,
    WebGPUData<T>,
  ],
  undefined,
  Promise<void>
> {
  const exprfn = typeof expr === "string" ? ((_type: DataType) => expr) : expr;

  return async function (
    backend: WebGPUBackend,
    [a, b, c]: [WebGPUData<T>, WebGPUData<T>, WebGPUData<T>],
    _args: undefined,
  ): Promise<void> {
    const type = ensureDataType(a.type, b.type, c.type);
    const pipeline = await backend.register(shader(type, exprfn(type)));

    backend.execute(
      pipeline,
      [128],
      [a, b, c],
    );
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
  `if (a < 0${type}) { return a * b; }  return a;`
);
