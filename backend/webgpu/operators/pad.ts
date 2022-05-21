import { DataType } from "../../types/data.ts";
import { ensureDataType } from "../../util/data.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import shader from "../shaders/pad.ts";

export async function pad<T extends DataType>(
  backend: WebGPUBackend,
  a: WebGPUData<T>,
  b: WebGPUData<T>,
  { w, h, t }: { w: number; h: number; t: number },
) {
  const type = ensureDataType(a.type, b.type);
  const pipeline = await backend.register(shader(type));
  const uniform = await WebGPUData.from(
    backend,
    new Uint32Array([w, h, t]),
    "u32",
    GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  );

  backend.execute(
    pipeline,
    [Math.ceil(w / 8), Math.ceil(h / 8), 1],
    [a, b, uniform],
  );
}
