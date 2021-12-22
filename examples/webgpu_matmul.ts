import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { matmul } from "../backend/webgpu/operators/matmul.ts";

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

await matmul(backend, a, b, c, uniform);

console.log(await c.get());
