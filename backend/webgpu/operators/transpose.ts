import { BackendOperator } from "../../types/backend.ts";
import { DataType } from "../../types/data.ts";
import { ensureDataType } from "../../util/data.ts";
import { WebGPUBackend } from "../backend.ts";
import { WebGPUData } from "../data.ts";
import shader from "../shaders/transpose.ts";

export const transpose: BackendOperator<
  WebGPUBackend,
  [WebGPUData, WebGPUData],
  { w: number; h: number },
  Promise<void>
> = async function transpose<T extends DataType>(
  backend: WebGPUBackend,
  [a, b]: [WebGPUData<T>, WebGPUData<T>],
  { w, h }: { w: number; h: number },
) {
  const type = ensureDataType(a.type, b.type);
  const pipeline = await backend.register(shader(type));
  const uniform = await WebGPUData.from(
    backend,
    new Uint32Array([w, h]),
    "u32",
    GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  );

  backend.execute(
    pipeline,
    [Math.ceil(w / 8), Math.ceil(h / 8), 1],
    [a, b, uniform],
  );
};
