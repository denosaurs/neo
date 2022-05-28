import {
  Backend,
  BackendConstructor,
  BackendOperator,
  BackendType,
} from "../types/backend.ts";
import { Data } from "../types/data.ts";
import { getDataConstructorFor } from "../util/data.ts";
import { WasmBackend } from "../wasm/backend.ts";
import { WebGPUBackend } from "../webgpu/backend.ts";

export interface CoreBackendOptions {
  backends?: (
    | Backend
    | BackendType
    | BackendConstructor<WasmBackend | WebGPUBackend>
  )[];
}

export class Core {
  initalized = false;
  supported = true;

  backends: Map<BackendType, Backend> = new Map();

  async initialize(options?: CoreBackendOptions): Promise<void> {
    const backends = options?.backends ?? ["wasm", "webgpu"];

    for (let backend of backends) {
      if (typeof backend === "string") {
        switch (backend) {
          case "wasm":
            backend = new WasmBackend();
            break;
          case "webgpu":
            backend = new WebGPUBackend();
            break;
        }
      }

      if (!("type" in backend)) {
        backend = new backend();
      }

      this.backends.set(backend.type, backend);
    }

    const initializing = [];
    for (const [type, backend] of this.backends) {
      if (!backend.supported) {
        this.backends.delete(type);
        continue;
      }

      if (!backend.initalized) {
        initializing.push(backend.initialize());
      }
    }
    await Promise.all(initializing);

    this.initalized = true;
  }
}

export async function operatorOnBackend<
  B extends Backend,
  D extends Data = Data,
  A extends Record<string, unknown> | undefined = undefined,
  R = void,
>(
  backend: B,
  operator: BackendOperator<B, D, A, R>,
  data: Data[],
  args: A,
): Promise<R> {
  const DataConstructor = getDataConstructorFor(backend.type);

  // TODO: Should and could definitely be optimized with a persistant data pool and "meta" allocator
  const convertedData: (Data | [Data, Data])[] = [];
  const conversions: Promise<void>[] = [];
  for (let index = 0; index < data.length; index++) {
    const entry = data[index];

    if (entry.backend.type !== backend.type) {
      conversions.push((async () => {
        const content = await entry.get();
        const temporaryData = await DataConstructor.from(
          backend,
          content,
          entry.type,
        );
        convertedData[index] = [entry, temporaryData];
      })());
    } else {
      convertedData[index] = entry;
    }
  }
  await Promise.all(conversions);

  const operatorData = convertedData.map((data) =>
    Array.isArray(data) ? data[1] : data
  ) as D[];
  const result = await operator(backend, operatorData, args);

  // Deconvert the converted data to its original form in case all of the data does not share the same backend type
  const deconversions: Promise<void>[] = [];
  for (const dataPair of convertedData) {
    if (Array.isArray(dataPair)) {
      deconversions.push((async () => {
        const [data, temporaryData] = dataPair;
        await data.set(await temporaryData.get());
        temporaryData.dispose();
      })());
    }
  }
  await Promise.all(deconversions);

  return result;
}
