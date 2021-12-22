import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { pad } from "../backend/webgpu/operators/pad.ts";

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
const b = new WebGPUData(backend, "f32", 16);

await pad(backend, a, b, { w: 3, h: 3, t: 4 });
console.log(await b.get());

// 1 2 3
// 4 5 6
// 7 8 9

// 1 2 3 0
// 4 5 6 0
// 7 8 9 0
// 0 0 0 0
