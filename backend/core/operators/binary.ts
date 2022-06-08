import { Data, DataType } from "../../types/data.ts";
import { WasmBackend } from "../../wasm/backend.ts";
import { Core, operatorOnBackend } from "../core.ts";
import * as wasm from "../../wasm/operators/binary.ts";
import * as webgpu from "../../webgpu/operators/binary.ts";
import { WebGPUBackend } from "../../webgpu/backend.ts";
import { BackendOperator } from "../../types/backend.ts";
import { WebGPUData } from "../../webgpu/data.ts";
import { WasmData } from "../../wasm/data.ts";

export function binary<T extends DataType>(
  wasmOperator: BackendOperator<
    WasmBackend,
    [WasmData<T>, WasmData<T>, WasmData<T>],
    undefined,
    void
  >,
  webgpuOperator: BackendOperator<
    WebGPUBackend,
    [WebGPUData<T>, WebGPUData<T>, WebGPUData<T>],
    undefined,
    Promise<void>
  >,
) {
  return async function (core: Core, data: [Data<T>, Data<T>, Data<T>]) {
    if (Math.max(...data.map(({ length }) => length)) <= 80 * 80) {
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

export const add = binary(wasm.add, webgpu.add);
export const sub = binary(wasm.sub, webgpu.sub);
export const mul = binary(wasm.mul, webgpu.mul);
export const div = binary(wasm.div, webgpu.div);
export const mod = binary(wasm.mod, webgpu.mod);
export const min = binary(wasm.min, webgpu.min);
export const max = binary(wasm.max, webgpu.max);
export const prelu = binary(wasm.prelu, webgpu.prelu);
