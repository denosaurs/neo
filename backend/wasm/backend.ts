// import { wasm } from "../../util.ts";
import { Backend, BackendRequest, DataType } from "../types.ts";
import { WasmData } from "./data.ts";

const decoder = new TextDecoder();

export interface WebGPUBackendRequest<T extends DataType = DataType>
  extends BackendRequest<T> {
  data: WasmData<T>[];
}

export class WasmBackend implements Backend {
  type = "wasm" as const;
  initalized = false;
  supported = true;

  instance: WebAssembly.Instance;

  async initialize(): Promise<void> {
    if (this.initalized) {
      return;
    }

    const { source } = await import("./wasm.js");
    const { instance: { exports } } = await WebAssembly.instantiate(source, {
      env: {
        panic: (ptr: number, len: number) => {
          const msg = decoder.decode(
            new Uint8Array(memory.buffer, ptr, len),
          );
          throw new Error(msg);
        },
      },
    });
    const memory = exports.memory as WebAssembly.Memory;
    const alloc = exports.alloc as (size: number) => number;
    const dealloc = exports.dealloc as (
      ptr: number,
      size: number,
    ) => void;

    this.initalized = true;
  }

  async register(code: string): Promise<string> {
    if (this.pipelines.has(code)) {
      return code;
    }

    const module = this.device.createShaderModule({ code });
    const pipeline = await this.device.createComputePipelineAsync({
      compute: { module, entryPoint: "main" },
    });
    const layout = pipeline.getBindGroupLayout(0);

    this.pipelines.set(code, [pipeline, layout]);
    return code;
  }

  // deno-lint-ignore require-await
  async execute(request: WasmBackendRequest): Promise<void> {
    const pipelineLayout = this.pipelines.get(request.pipeline);
    if (!pipelineLayout) {
      throw "Could not find pipeline";
    }
    const [pipeline, layout] = pipelineLayout;

    const entries = request.data.map(({ buffer }, index) => ({
      binding: index,
      resource: { buffer },
    }));
    const bindgroup = this.device.createBindGroup({ layout, entries });

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setBindGroup(0, bindgroup);
    passEncoder.setPipeline(pipeline);
    passEncoder.dispatch(...request.workgroups as [number, number, number]);
    passEncoder.endPass();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}
