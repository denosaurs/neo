import { Data, DataType } from "../../types/data.ts";
import { WasmBackend } from "../../wasm/backend.ts";
import { Core, operatorOnBackend } from "../core.ts";
import * as wasm from "../../wasm/operators/unary.ts";
import * as webgpu from "../../webgpu/operators/unary.ts";
import { WebGPUBackend } from "../../webgpu/backend.ts";
import { BackendOperator } from "../../types/backend.ts";
import { WebGPUData } from "../../webgpu/data.ts";
import { WasmData } from "../../wasm/data.ts";

export function unary<T extends DataType>(
  wasmOperator: BackendOperator<
    WasmBackend,
    [WasmData<T>, WasmData<T>],
    undefined,
    void
  >,
  webgpuOperator: BackendOperator<
    WebGPUBackend,
    [WebGPUData<T>, WebGPUData<T>],
    undefined,
    Promise<void>
  >,
) {
  return async function (core: Core, data: [Data<T>, Data<T>]) {
    if (Math.max(...data.map(({ length }) => length)) <= 90 * 90) {
      return await operatorOnBackend(
        core.backends.get("wasm")! as WasmBackend,
        wasmOperator,
        data,
        undefined,
      );
    } else {
      return await operatorOnBackend(
        core.backends.get("webgpu")! as WebGPUBackend,
        webgpuOperator,
        data,
        undefined,
      );
    }
  };
}

export const abs = unary(wasm.abs, webgpu.abs);
export const linear = unary<"f32" | "u32" | "i32">(wasm.linear, webgpu.linear);
export const neg = unary<"f32" | "i32">(wasm.neg, webgpu.neg);
export const inc = unary<"f32" | "u32" | "i32">(wasm.inc, webgpu.inc);
export const dec = unary<"f32" | "u32" | "i32">(wasm.dec, webgpu.dec);
export const relu = unary<"f32" | "i32">(wasm.relu, webgpu.relu);
export const relu6 = unary<"f32" | "i32">(wasm.relu6, webgpu.relu6);
export const ceil = unary<"f32">(wasm.ceil, webgpu.ceil);
export const floor = unary<"f32">(wasm.floor, webgpu.floor);
export const round = unary<"f32">(wasm.round, webgpu.round);
export const sqrt = unary<"f32">(wasm.sqrt, webgpu.sqrt);
export const rsqrt = unary<"f32">(wasm.rsqrt, webgpu.rsqrt);
export const selu = unary<"f32">(wasm.selu, webgpu.selu);
export const sigmoid = unary<"f32">(wasm.sigmoid, webgpu.sigmoid);
export const square = unary<"f32" | "u32" | "i32">(wasm.square, webgpu.square);
export const cos = unary<"f32">(wasm.cos, webgpu.cos);
export const cosh = unary<"f32">(wasm.cosh, webgpu.cosh);
export const sin = unary<"f32">(wasm.sin, webgpu.sin);
export const sinh = unary<"f32">(wasm.sinh, webgpu.sinh);
export const tan = unary<"f32">(wasm.tan, webgpu.tan);
export const tanh = unary<"f32">(wasm.tanh, webgpu.tanh);
export const exp = unary<"f32">(wasm.exp, webgpu.exp);
export const elu = unary<"f32">(wasm.elu, webgpu.elu);
export const log = unary<"f32">(wasm.log, webgpu.log);
