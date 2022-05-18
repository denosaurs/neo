import {
  Backend,
  BackendConstructor,
  BackendOperator,
  BackendRequest,
  BackendType,
  Data,
  DataArray,
  DataConstructor,
  DataType,
  GetBackendOperatorArgs,
  GetBackendOperatorBackend,
  GetBackendOperatorData,
  GetDataDataType,
} from "../types.ts";
import { isConstructor } from "../util.ts";
import { WasmBackend } from "../wasm/backend.ts";
import { WebGPUBackend } from "../webgpu/backend.ts";

export type CoreBackendType = Exclude<BackendType, "core">;

export interface CoreBackendOptions {
  backends?: (CoreBackendType | BackendConstructor<WasmBackend | WebGPUBackend> | Backend)[];
}

export interface CoreBackendRequest<
  O extends BackendOperator<B, A, Data<T, B>>,
  T extends DataType = GetDataDataType<GetBackendOperatorData<O>>,
  B extends CoreBackend = GetBackendOperatorBackend<O>,
  A extends Record<string, unknown> = GetBackendOperatorArgs<O>,
  > extends BackendRequest<T, Backend> {
  backend: B["type"];
  operator: O;
  args: A;
  data: Data<T, Backend>[];
}


export class CoreBackend implements Backend {
  type = "core" as const;
  initalized = false;
  supported = true;

  backends: Map<BackendType, Backend> = new Map();

  async initialize(options?: CoreBackendOptions): Promise<void> {
    const backends = options?.backends ?? ["wasm", "webgpu"];

    for (let backend of backends) {
      if (typeof backend === "string") {
        switch (backend) {
          case "wasm": backend = new WasmBackend(); break;
          case "webgpu": backend = new WebGPUBackend(); break;
        }
      }

      if (isConstructor(backend)) {
        backend = new (backend as BackendConstructor)();
      }

      this.backends.set(
        (backend as Backend).type as BackendType,
        backend as Backend,
      );
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

  async execute<
    O extends BackendOperator,
    T extends DataType = GetDataDataType<GetBackendOperatorData<O>>,
    B extends Backend = GetBackendOperatorBackend<O>,
    >(request: CoreBackendRequest<O>): Promise<void> {
    if (!this.backends.has(request.backend)) {
      throw new Error(
        `The CoreBackend does not contain a sub-backend of type ${request.backend}`,
      );
    }

    const backend: B = this.backends.get(request.backend)! as B;

    // TODO: Should and could definitely be optimized with a persistant data pool and "meta" allocator
    const dataArray: ([Data<T, B>, GetBackendOperatorData<O>] | GetBackendOperatorData<O>)[] = [];
    const dataConversionPromises: Promise<void>[] = [];
    for (let index = 0; index < request.data.length; index++) {
      const data = request.data[index] as unknown as Data<T, B>;
      if (data.backend.type !== backend.type) {
        dataConversionPromises.push((async () => {
          const content = await data.get();
          const temporaryData =
            await DataConstructor[backend.type as CoreBackendType].from(
              // deno-lint-ignore no-explicit-any
              backend as any,
              content,
              data.type
            ) as unknown as GetBackendOperatorData<O>;
          dataArray[index] = [data, temporaryData];
        })());
      } else {
        dataArray[index] = data as unknown as GetBackendOperatorData<O>;
      }
    }
    await Promise.all(dataConversionPromises);

    const operatorData = dataArray.map((data) => Array.isArray(data) ? data[1] : data) as GetBackendOperatorData<O>[];
    // deno-lint-ignore no-explicit-any
    await request.operator(backend, request.args, ...operatorData as any);

    // Deconvert the converted data to its original form in case all of the data does not share the same backend type
    const dataDeconversionPromises: Promise<void>[] = [];
    for (const dataPair of dataArray) {
      if (Array.isArray(dataPair)) {
        dataDeconversionPromises.push((async () => {
          const [data, temporaryData] = dataPair as [Data<T, B>, GetBackendOperatorData<O>];
          await data.set(await temporaryData.get() as DataArray<T>);
          temporaryData.dispose();
        })());
      }
    }
    await Promise.all(dataDeconversionPromises);
  }
}
