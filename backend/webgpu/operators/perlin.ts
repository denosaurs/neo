import { BackendOperator } from "../../types/backend.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import shader from "../shaders/perlin.ts";

export const perlin: BackendOperator<
  WebGPUBackend,
  [WebGPUData<"i32">, WebGPUData<"vec2<f32>">, WebGPUData<"f32">],
  { m: number; n: number; k: number },
  Promise<void>
> = async function perlin(
  backend: WebGPUBackend,
  [a, b, c]: [WebGPUData<"i32">, WebGPUData<"vec2<f32>">, WebGPUData<"f32">],
  { m, n, k }: { m: number; n: number; k: number },
) {
  const pipeline = await backend.register(shader());
  const meta = await WebGPUData.from(backend, new Uint32Array([m, n, k]));

  backend.execute(
    pipeline,
    [Math.ceil(n / 8), Math.ceil(m / 8), 1],
    [a, b, c, meta],
  );
};
