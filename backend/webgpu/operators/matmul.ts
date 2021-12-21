import { DataType } from "../../types.ts";
import { ensureType } from "../../util.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import { matmul as shader } from "../shaders/matmul.ts";
import { f32, Struct, u32 } from "../../../deps.ts";

const Meta = new Struct({
  m: u32,
  n: u32,
  k: u32,
  alpha: f32,
});

export async function matmul<T extends DataType>(
  backend: WebGPUBackend,
  a: WebGPUData<T>,
  b: WebGPUData<T>,
  c: WebGPUData<T>,
  meta: { m: number; n: number; k: number; alpha: number },
) {
  const type = ensureType(a.type, b.type, c.type);
  const label = `matmul_${type}`;
  await backend.register(label, shader(type));

  const metaBuffer = new ArrayBuffer(Meta.size);
  const metaView = new DataView(metaBuffer);
  Meta.write(metaView, 0, meta);
  const metaU32 = new Uint32Array(metaBuffer);
  const metaData = await WebGPUData.from(backend, metaU32);

  await backend.execute({
    pipeline: label,
    data: [a, b, metaData, c],
    workgroups: [Math.ceil(meta.n / 8), Math.ceil(meta.m / 8), 1],
  });
}
