import { DataType } from "../../types.ts";
import { ensureType } from "../../util.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import { matmul as shader } from "../shaders/matmul.ts";

export async function matmul<T extends DataType>(
  backend: WebGPUBackend,
  a: WebGPUData<T>,
  b: WebGPUData<T>,
  c: WebGPUData<T>,
  { m, n, k }: { m: number; n: number; k: number },
) {
  const type = ensureType(a.type, b.type, c.type);
  const pipeline = await backend.register(shader(type));
  const uniform = await WebGPUData.from(
    backend,
    new Uint32Array([m, n, k]),
    GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  );

  await backend.execute({
    pipeline,
    data: [a, b, c, uniform],
    workgroups: [Math.ceil(n / 8), Math.ceil(m / 8), 1],
  });
}
