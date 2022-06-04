import { Data } from "../../types/data.ts";
import { WasmBackend } from "../../wasm/backend.ts";
import { Core, operatorOnBackend } from "../core.ts";
import { matmul as wasmMatmul } from "../../wasm/operators/matmul.ts";
import { matmul as webgpuMatmul } from "../../webgpu/operators/matmul.ts";
import { WebGPUBackend } from "../../webgpu/backend.ts";

export function matmul<T extends "f32" | "u32" | "i32">(
  core: Core,
  data: [Data<T>, Data<T>, Data<T>],
  args: { m: number; n: number; k: number },
) {
  if (Math.max(...data.map(({ length }) => length)) <= 72 * 72) {
    return operatorOnBackend(
      core.backends.get("wasm")! as WasmBackend,
      wasmMatmul,
      data,
      args,
    );
  } else {
    return operatorOnBackend(
      core.backends.get("webgpu")! as WebGPUBackend,
      webgpuMatmul,
      data,
      args,
    );
  }
}
