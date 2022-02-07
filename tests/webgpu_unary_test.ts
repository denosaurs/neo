import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { relu } from "../backend/webgpu/operators/unary.ts";
import { assertEquals } from "./deps.ts";

const backend = new WebGPUBackend();
await backend.initialize();

const a = await WebGPUData.from<"f32">(
  backend,
  new Float32Array(10).fill(-1),
);
const b = new WebGPUData(backend, "f32", 10);

Deno.test({
  name: "Unary ReLU",
  async fn() {
    await relu(backend, a, b);
    const expected = new Float32Array(10).fill(0)
    assertEquals(await b.get(), expected);
  },
  sanitizeResources: false
});