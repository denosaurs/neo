import { BackendRequest, DataType, Operator } from "../types.ts";
import { WebGPUBackend } from "./backend.ts";
import { WebGPUData } from "./data.ts";

export type Workgroups =
  | [number, number, number]
  | [number, number]
  | [number];

export interface WebGPUBackendRequest<T extends DataType = DataType>
  extends BackendRequest<T> {
  pipeline: string;
  data: WebGPUData<T>[];
  workgroups: Workgroups;
}

export type WebGPUOperator<T extends DataType = DataType> = Operator<T> & {
  backend: WebGPUBackend;
  data: WebGPUData<T>[];
};
