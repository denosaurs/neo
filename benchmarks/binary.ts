import { Core } from "../backend/core/core.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { WasmData } from "../backend/wasm/data.ts";
import { add as wasmAdd } from "../backend/wasm/operators/binary.ts";
import { add as webgpuAdd } from "../backend/webgpu/operators/binary.ts";
import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WasmBackend } from "../backend/wasm/backend.ts";

const core = new Core();
await core.initialize();

const webgpuBackend = core.backends.get("webgpu")! as WebGPUBackend;
const wasmBackend = core.backends.get("wasm")! as WasmBackend;

for (let i = 64; i < 128; i += 8) {
  // WebGPU
  Deno.bench(`webgpu ${i} * ${i}`, {
    group: `${i} * ${i}`,
  }, async () => {
    const a = await WebGPUData.from(
      webgpuBackend,
      new Float32Array(i * i).fill(4),
      "f32",
    );
    const b = await WebGPUData.from(
      webgpuBackend,
      new Float32Array(i * i).fill(4),
      "f32",
    );
    const c = new WebGPUData(
      webgpuBackend,
      "f32",
      i * i,
    );

    await webgpuAdd(webgpuBackend, [a, b, c], undefined);

    a.dispose();
    b.dispose();
    c.dispose();
  });
  // WASM
  Deno.bench(`wasm ${i} * ${i}`, {
    group: `${i} * ${i}`,
  }, async () => {
    const a = await WasmData.from(
      wasmBackend,
      new Float32Array(i * i).fill(4),
      "f32",
    );
    const b = await WasmData.from(
      wasmBackend,
      new Float32Array(i * i).fill(4),
      "f32",
    );
    const c = new WasmData(
      wasmBackend,
      "f32",
      i * i,
    );

    wasmAdd(wasmBackend, [a, b, c], undefined);

    a.dispose();
    b.dispose();
    c.dispose();
  });
}
