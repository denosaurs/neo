import { WasmBackend } from "../backend/wasm/backend.ts";
import { WasmData } from "../backend/wasm/data.ts";
import { matmul } from "../backend/wasm/operators/matmul.ts";
import { assertEquals } from "./deps.ts";

const backend = new WasmBackend();
await backend.initialize();

const uniform = { m: 2, n: 2, k: 2 };

const a: WasmData<"f32"> = await WasmData.from(
  backend,
  new Float32Array(uniform.m * uniform.k).fill(2),
);
const b: WasmData<"f32"> = await WasmData.from(
  backend,
  new Float32Array(uniform.n * uniform.k).fill(2),
);
const c: WasmData<"f32"> = new WasmData(backend, "f32", uniform.m * uniform.n);

Deno.test({
  name: "Matrix Multiply",
  async fn() {
    await matmul(backend, a, b, c, uniform);
    const expected = new Float32Array(4).fill(8);
    assertEquals(await c.get(), expected);
  },
  sanitizeResources: false,
});
