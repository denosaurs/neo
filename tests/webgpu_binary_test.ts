import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { add, div, mul, sub } from "../backend/webgpu/operators/binary.ts";
import {assertEquals} from "./deps.ts";

const backend = new WebGPUBackend();
await backend.initialize();

const a = await WebGPUData.from(
  backend,
  new Float32Array(16).fill(4),
  "vec2<f32>"
);
const b = await WebGPUData.from(
  backend,
  new Float32Array(16).fill(4),
  "vec2<f32>"
);
const c = new WebGPUData(backend, "vec2<f32>", 16);


Deno.test({
  name: "Binary Add",
  async fn() {
    await add(backend, a, b, c);
    const expected = new Float32Array(16).fill(8)
    assertEquals(await c.get(), expected);
  },
  sanitizeResources: false
});

Deno.test({
  name: "Binary Subtract",
  async fn() {
    await sub(backend, a, b, c);
    const expected = new Float32Array(16).fill(0)
    assertEquals(await c.get(), expected);
  },
  sanitizeResources: false
});

Deno.test({
  name: "Binary Multiply",
  async fn() {
    await mul(backend, a, b, c);
    const expected = new Float32Array(16).fill(16)
    assertEquals(await c.get(), expected);
  },
  sanitizeResources: false
});

Deno.test({
  name: "Binary Divide",
  async fn() {
    await div(backend, a, b, c);
    const expected = new Float32Array(16).fill(1)
    assertEquals(await c.get(), expected);
  },
  sanitizeResources: false
});
