import { BackendType } from "../types/backend.ts";
import {
  DataConstructor,
  DataPrimitive,
  DataPrimitiveArrayConstructor,
  DataType,
  DataTypeArrayConstructor,
} from "../types/data.ts";
import { WasmData } from "../wasm/data.ts";
import { WebGPUData } from "../webgpu/data.ts";

/**
 * Ensures that all {@link DataType}s match the {@link type} parameter
 *
 * @param type The target {@link DataType} which we want all other types to match
 * @param types An arbitrary number of {@link DataType}s which we want to match {@link type}
 * @returns If successful {@link type} otherwise it throws a {@link TypeError}
 */
export function ensureDataType<T extends DataType>(
  type: T,
  ...types: DataType[]
): T {
  if (types.every((value) => value === type)) {
    return type;
  }

  throw new TypeError(`Expected all DataTypes to be ${type}`);
}

/**
 * Gets the inner {@link DataPrimitive} of the {@link type} parameter
 *
 * @param type Any {@link DataType}
 * @returns The inner {@link DataPrimitive} of {@link type}
 */
export function getPrimitive<T extends DataType>(
  type: T,
): T extends DataType<infer D> ? D : never {
  // deno-fmt-ignore
  return (
      type.startsWith("vec") ? type.slice(5, -1)
    : type.startsWith("mat") ? type.slice(7, -1)
    : type
  ) as T extends DataType<infer D> ? D : never;
}

/**
 * A lookup table for the different {@link DataPrimitive} array constructors
 */
export const lookupDataPrimitiveArrayConstructor: {
  [T in DataPrimitive]: DataPrimitiveArrayConstructor<T>;
} = {
  u32: Uint32Array,
  i32: Int32Array,
  f32: Float32Array,
};

/**
 * Gets the associated array constructor for the {@link type} parameter
 *
 * @param type A {@link DataPrimitive}
 * @returns The associated array constructor
 */
export function getDataPrimitiveArrayConstructor<T extends DataPrimitive>(
  type: T,
): DataPrimitiveArrayConstructor<T> {
  return lookupDataPrimitiveArrayConstructor[type];
}

/**
 * Gets the associated array constructor for the {@link type} parameter
 *
 * @param type A {@link DataType}
 * @returns The associated array constructor
 */
export function getDataTypeArrayConstructor<T extends DataType>(
  type: T,
): DataTypeArrayConstructor<T> {
  return getDataPrimitiveArrayConstructor(getPrimitive(type));
}

export function assertDataPrimitive(
  type: string,
): asserts type is DataPrimitive {
  if (type === "u32" || type === "i32" || type === "f32") {
    return;
  }

  throw new TypeError(`${type} is not of type DataPrimitive (u32 | i32 | f32)`);
}

/**
 * A lookup table for the respective {@link BackendType}s {@link Data} constructors
 */
export const lookupDataConstructor = {
  "wasm": WasmData,
  "webgpu": WebGPUData,
};

export function getDataConstructorFor(type: BackendType) {
  return lookupDataConstructor[type] as DataConstructor;
}
