import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { matmul } from "../backend/webgpu/operators/matmul.ts";
import {assertEquals} from "./deps.ts";

const backend = new WebGPUBackend();
await backend.initialize();

const uniform = { m: 2, n: 2, k: 2, alpha: 1 };

const a = await WebGPUData.from(
  backend,
  new Float32Array(uniform.m * uniform.k).fill(2),
);
const b = await WebGPUData.from(
  backend,
  new Float32Array(uniform.n * uniform.k).fill(2),
);
const c = new WebGPUData(backend, "f32", uniform.m * uniform.n);


Deno.test({
  name: "Matrix Multiply",
  async fn() {
    await matmul(backend, a, b, c, uniform);
    const expected = new Float32Array(4).fill(8)
    assertEquals(await c.get(), expected);
  },
  sanitizeResources: false
});
