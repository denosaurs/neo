import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { matmul } from "../backend/webgpu/operators/matmul.ts";

const backend = new WebGPUBackend();
await backend.initialize();

const meta = { m: 2, n: 2, k: 2, alpha: 1 };

const a = await WebGPUData.from(
  backend,
  new Float32Array(meta.m * meta.k).fill(2),
);
const b = await WebGPUData.from(
  backend,
  new Float32Array(meta.n * meta.k).fill(2),
);
const c = new WebGPUData(backend, "f32", meta.m * meta.n);

await matmul(backend, a, b, c, meta);

console.log(await c.get());
