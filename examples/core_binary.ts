import { CoreBackend } from "../backend/core/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { WasmData } from "../backend/wasm/data.ts";
import { add, div, mul, sub } from "../backend/webgpu/operators/binary.ts";
import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WasmBackend } from "../backend/wasm/backend.ts";

const backend = new CoreBackend();
await backend.initialize();

const a = await WebGPUData.from(
  backend.backends.get("webgpu")! as WebGPUBackend,
  new Float32Array(16).fill(4),
  "f32",
);
const b = await WasmData.from(
  backend.backends.get("wasm")! as WasmBackend,
  new Float32Array(16).fill(4),
  "f32",
);
const c = new WasmData(backend.backends.get("wasm")! as WasmBackend, "f32", 16);

await backend.execute({
  backend: "webgpu",
  //@ts-ignore temporary for testing
  operator: add,
  args: undefined,
  data: [a, b, c],
});

console.log(await c.get());
