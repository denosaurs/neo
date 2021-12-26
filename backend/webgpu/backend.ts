import { enableValidationErrors } from "../../deps.ts";
import { webgpu } from "../../util.ts";
import { Backend, BackendRequest, DataType } from "../types.ts";
import { WebGPUData } from "./data.ts";
import { Workgroups } from "./types.ts";

export interface WebGPUBackendRequest<T extends DataType = DataType>
  extends BackendRequest<T> {
  pipeline: string;
  data: WebGPUData<T>[];
  workgroups: Workgroups;
}

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
    });
    const layout = pipeline.getBindGroupLayout(0);

    this.pipelines.set(code, [pipeline, layout]);
    return code;
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
