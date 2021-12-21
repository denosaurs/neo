import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { add, sub, mul, div } from "../backend/webgpu/operators/binary.ts";

const backend = new WebGPUBackend();
await backend.initialize();

const a = await WebGPUData.from(
  backend,
  new Float32Array(10).fill(4),
);
const b = await WebGPUData.from(
  backend,
  new Float32Array(10).fill(4),
);
const c = new WebGPUData(backend, "f32", 10);

await add(backend, a, b, c);
console.log(await c.get());

await sub(backend, a, b, c);
console.log(await c.get());

await mul(backend, a, b, c);
console.log(await c.get());

await div(backend, a, b, c);
console.log(await c.get());
