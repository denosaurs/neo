import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { add, div, mul, sub } from "../backend/webgpu/operators/binary.ts";

const backend = new WebGPUBackend();
await backend.initialize();

const a = await WebGPUData.from(
  backend,
  new Float32Array(16).fill(4),
  ["vec2", "f32"]
);
const b = await WebGPUData.from(
  backend,
  new Float32Array(16).fill(4),
  ["vec2", "f32"]
);
const c = new WebGPUData(backend, ["vec2", "f32"], 16);

await add(backend, a, b, c);
console.log(await c.get());

await sub(backend, a, b, c);
console.log(await c.get());

await mul(backend, a, b, c);
console.log(await c.get());

await div(backend, a, b, c);
console.log(await c.get());
