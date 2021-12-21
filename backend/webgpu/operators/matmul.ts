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
  const label = `matmul_${type}`;
  await backend.register(label, shader(type));

  const meta = await WebGPUData.from(backend, new Uint32Array([m, n, k]));

  await backend.execute({
    pipeline: label,
    data: [a, b, c, meta],
    workgroups: [Math.ceil(n / 8), Math.ceil(m / 8), 1],
  });
}
