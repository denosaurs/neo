import { DataType } from "../../types/data.ts";
import { ensureDataType } from "../../util/data.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import shader from "../shaders/matmul.ts";

export async function matmul<T extends DataType>(
  backend: WebGPUBackend,
  a: WebGPUData<T>,
  b: WebGPUData<T>,
  c: WebGPUData<T>,
  { m, n, k }: { m: number; n: number; k: number },
) {
  const type = ensureDataType(a.type, b.type, c.type);
  const pipeline = await backend.register(shader(type));
  const uniform = await WebGPUData.from(
    backend,
    new Uint32Array([m, n, k]),
    "u32",
    GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  );

  backend.execute(
    pipeline,
    [Math.ceil(n / 8), Math.ceil(m / 8), 1],
    [a, b, c, uniform],
  );
}
