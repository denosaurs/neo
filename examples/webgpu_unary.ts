import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { relu } from "../backend/webgpu/operators/unary.ts";

const backend = new WebGPUBackend();
await backend.initialize();

const a = await WebGPUData.from<"f32">(
  backend,
  new Float32Array(10).fill(-1),
);
const b = new WebGPUData(backend, "f32", 10);

await relu(backend, a, b);
console.log(await b.get());
