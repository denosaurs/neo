import { enableValidationErrors } from "../../deps.ts";
import { webgpu } from "../../util.ts";
import { Backend } from "../types/backend.ts";
import { WebGPUData } from "./data.ts";
import { Workgroups } from "./types.ts";

export class WebGPUBackend implements Backend {
  type = "webgpu" as const;
  initalized = false;
  supported = webgpu;

  operators = new Map();

  adapter!: GPUAdapter;
  device!: GPUDevice;
  pipelines: Map<string, [GPUComputePipeline, GPUBindGroupLayout]> = new Map();

  async initialize(options?: GPURequestAdapterOptions): Promise<void> {
    if (this.initalized) {
      return;
    }

    let adapter = null;

    try {
      adapter = await navigator.gpu.requestAdapter(options);
      // deno-lint-ignore no-empty
    } catch {}

    if (adapter === null) {
      this.supported = false;
      return;
    }

    this.initalized = true;
    this.adapter = adapter;
    this.device = await adapter.requestDevice();

    enableValidationErrors(this.device, true);
  }

  async register(code: string): Promise<string> {
    if (this.pipelines.has(code)) {
      return code;
    }

    const module = this.device.createShaderModule({ code });
    const pipeline = await this.device.createComputePipelineAsync({
      compute: { module, entryPoint: "main" },
      layout: "auto"
    });
    const layout = pipeline.getBindGroupLayout(0);

    this.pipelines.set(code, [pipeline, layout]);
    return code;
  }

  execute(
    name: string,
    workgroups: Workgroups,
    args: (WebGPUData | GPUBuffer)[],
  ) {
    const pipelineLayout = this.pipelines.get(name);
    if (!pipelineLayout) {
      throw "Could not find pipeline";
    }
    const [pipeline, layout] = pipelineLayout;

    const entries = args.map((arg, index) => ({
      binding: index,
      resource: { buffer: arg instanceof GPUBuffer ? arg : arg.buffer },
    }));
    const bindgroup = this.device.createBindGroup({ layout, entries });

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setBindGroup(0, bindgroup);
    passEncoder.setPipeline(pipeline);
    passEncoder.dispatchWorkgroups(...workgroups as [number, number, number]);
    passEncoder.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}
