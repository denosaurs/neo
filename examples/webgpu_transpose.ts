import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { transpose } from "../backend/webgpu/operators/transpose.ts";

const backend = new WebGPUBackend();
await backend.initialize();

// deno-fmt-ignore
const a = await WebGPUData.from<"f32">(
  backend,
  new Float32Array([
    1, 2, 3,
    4, 5, 6,
    7, 8, 9
  ]),
);
const b = new WebGPUData(backend, "f32", 9);

await transpose(backend, a, b, { w: 3, h: 3 });
console.log(await b.get());

// 1 2 3
// 4 5 6

// 1 4
// 2 5
// 3 6
