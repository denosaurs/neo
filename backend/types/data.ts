import { Backend } from "./backend.ts";

export type DataPrimitive = "u32" | "i32" | "f32";
export type DataPrimitiveArray<T extends DataPrimitive = DataPrimitive> =
  T extends "u32" ? Uint32Array
    : T extends "i32" ? Int32Array
    : T extends "f32" ? Float32Array
    : never;
export type DataPrimitiveArrayConstructor<
  T extends DataPrimitive = DataPrimitive,
> = T extends "u32" ? Uint32ArrayConstructor
  : T extends "i32" ? Int32ArrayConstructor
  : T extends "f32" ? Float32ArrayConstructor
  : never;

export type DataDimension = 2 | 3 | 4;
export type DataVec<
  T extends DataPrimitive = DataPrimitive,
  X extends DataDimension = DataDimension,
> = `vec${X}<${T}>`;
export type DataMat<
  T extends DataPrimitive = DataPrimitive,
  X extends DataDimension = DataDimension,
  Y extends DataDimension = DataDimension,
> = `mat${X}x${Y}<${T}>`;
export type DataType<T extends DataPrimitive = DataPrimitive> =
  | T
  | DataVec<T>
  | DataMat<T>;

export type DataTypeArray<D extends DataType = DataType> = DataPrimitiveArray<
  D extends DataType<infer T> ? T : never
>;
export type DataTypeArrayConstructor<D extends DataType = DataType> =
  DataPrimitiveArrayConstructor<D extends DataType<infer T> ? T : never>;

export interface DataConstructor {
  from<T extends DataType, B extends Backend>(
    backend: B,
    source: DataTypeArray<T>,
    type?: T,
  ): Promise<Data<T> & { backend: B }>;

  new <T extends DataType, B extends Backend>(
    backend: B,
    type: T,
    length: number,
  ): Data<T> & { backend: B };
}

export interface Data<T extends DataType = DataType> {
  readonly backend: Backend;
  readonly type: T;
  length: number;

  set(data: DataTypeArray<T>): Promise<void>;
  get(): Promise<DataTypeArray<T>>;
  dispose(): void;
}
