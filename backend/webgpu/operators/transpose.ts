import { DataType } from "../../types.ts";
import { ensureType } from "../../util.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import { transpose as shader } from "../shaders/transpose.ts";

export async function transpose<T extends DataType>(
  backend: WebGPUBackend,
  a: WebGPUData<T>,
  b: WebGPUData<T>,
  { w, h }: { w: number; h: number },
) {
  const type = ensureType(a.type, b.type);
  const pipeline = await backend.register(shader(type));

  const meta = await WebGPUData.from(backend, new Uint32Array([w, h]));

  await backend.execute({
    pipeline,
    data: [a, b, meta],
    workgroups: [Math.ceil(w / 8), Math.ceil(h / 8), 1],
  });
}