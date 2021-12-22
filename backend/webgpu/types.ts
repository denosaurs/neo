import { BackendRequest, DataType } from "../types.ts";
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
