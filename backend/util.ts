import { DataType, DataPrimitive } from "./types.ts";

export function ensureType(...types: DataType[]) {
  const type = types[0];
  if (types.every((value) => value === type)) {
    return type;
  } else {
    throw `Expected all types to be of type ${type}`;
  }
}

export function getType(type: DataType): DataPrimitive {
  return (type.startsWith("vec2") ? type.slice(5, -1) : type) as DataPrimitive
}