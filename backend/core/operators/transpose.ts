import { Data } from "../../types/data.ts";
import { WasmBackend } from "../../wasm/backend.ts";
import { Core, operatorOnBackend } from "../core.ts";
import { transpose as wasmTranspose } from "../../wasm/operators/transpose.ts";
import { transpose as webgpuTranspose } from "../../webgpu/operators/transpose.ts";
import { WebGPUBackend } from "../../webgpu/backend.ts";

export async function transpose<T extends "f32" | "u32" | "i32">(
  core: Core,
  data: [Data<T>, Data<T>],
  args: { w: number; h: number },
) {
  if (Math.max(...data.map(({ length }) => length)) <= 90 * 90) {
    return await operatorOnBackend(
      core.backends.get("wasm")! as WasmBackend,
      wasmTranspose,
      data,
      args,
    );
  } else {
    return await operatorOnBackend(
      core.backends.get("webgpu")! as WebGPUBackend,
      webgpuTranspose,
      data,
      args,
    );
  }
}
