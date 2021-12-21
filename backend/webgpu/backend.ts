import { webgpu } from "../../util.ts";
import { Backend } from "../types.ts";
import { WebGPUBackendRequest } from "./types.ts";

export class WebGPUBackend implements Backend {
  type = "webgpu" as const;
  initalized = false;
  supported = webgpu;

  adapter!: GPUAdapter;
  device!: GPUDevice;
  pipelines: Map<string, [GPUComputePipeline, GPUBindGroupLayout]> = new Map();

  async initialize(options?: GPURequestAdapterOptions): Promise<void> {
    if (this.initalized) {
      return;
    }

    const adapter = await navigator.gpu.requestAdapter(options) || null;

    if (adapter === null) {
      this.supported = false;
      return;
    }

    this.initalized = true;
    this.adapter = adapter;
    this.device = await adapter.requestDevice();
  }

  async register(label: string, code: string) {
    if (this.pipelines.has(label)) {
      return;
    }

    const module = this.device.createShaderModule({ code });
    const pipeline = await this.device.createComputePipelineAsync({
      compute: { module, entryPoint: "main" },
    });
    const layout = pipeline.getBindGroupLayout(0);

    this.pipelines.set(label, [pipeline, layout]);
  }

  // deno-lint-ignore require-await
  async execute(request: WebGPUBackendRequest): Promise<void> {
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
