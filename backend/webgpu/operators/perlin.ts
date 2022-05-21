import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import shader from "../shaders/perlin.ts";

export async function perlin(
  backend: WebGPUBackend,
  a: WebGPUData<"i32">,
  b: WebGPUData<"vec2<f32>">,
  c: WebGPUData<"f32">,
  { m, n, k }: { m: number; n: number; k: number },
) {
  const pipeline = await backend.register(shader());
  const meta = await WebGPUData.from(backend, new Uint32Array([m, n, k]));

  backend.execute(
    pipeline,
    [Math.ceil(n / 8), Math.ceil(m / 8), 1],
    [a, b, c, meta],
  );
}
