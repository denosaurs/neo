import { DataType, DataPrimitive } from "./types.ts";

export function ensureType(...types: DataType[]) {
  const type = types[0];
  if (type[0] ? types.every((value) => value[0] === type[0] && value[1] === type[1])
    : types.every((value) => value === type)) {
    return type;
  } else {
    throw `Expected all types to be of type ${type}`;
  }
}

export function getType(type: DataType): DataPrimitive {
  return (type[1] || type) as DataPrimitive
}

export function fmtType(type: DataType): string {
  return type[0] ? `${type[0]}<${type[1]}>` : type as string
}