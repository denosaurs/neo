import { Core } from "../backend/core/core.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { WasmData } from "../backend/wasm/data.ts";
import { linear as wasmLinear } from "../backend/wasm/operators/unary.ts";
import { linear as webgpuLinear } from "../backend/webgpu/operators/unary.ts";
import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WasmBackend } from "../backend/wasm/backend.ts";

const core = new Core();
await core.initialize();

const webgpuBackend = core.backends.get("webgpu")! as WebGPUBackend;
const wasmBackend = core.backends.get("wasm")! as WasmBackend;

for (let i = 64; i <= 128; i += 8) {
  // WebGPU
  Deno.bench(`webgpu ${i} * ${i}`, {
    group: `${i} * ${i}`,
  }, async () => {
    const a = await WebGPUData.from(
      webgpuBackend,
      new Float32Array(i * i).fill(4),
      "f32",
    );
    const b = new WebGPUData(
      webgpuBackend,
      "f32",
      i * i,
    );

    await webgpuLinear(webgpuBackend, [a, b], undefined);

    a.dispose();
    b.dispose();
  });
  // Wasm
  Deno.bench(`wasm ${i} * ${i}`, {
    group: `${i} * ${i}`,
  }, async () => {
    const a = await WasmData.from(
      wasmBackend,
      new Float32Array(i * i).fill(4),
      "f32",
    );
    const b = new WasmData(
      wasmBackend,
      "f32",
      i * i,
    );

    wasmLinear(wasmBackend, [a, b], undefined);

    a.dispose();
    b.dispose();
  });
}
