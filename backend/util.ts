import { DataType, DataPrimitive } from "./types.ts";

export function ensureType(...types: DataType[]) {
  const type = types[0];
  if (
    typeof type == "string" ? types.every((value) => value === type) :
      types.every((value) => value[0] === type[0] && value[1] === type[1])
  ) {
    return type;
  } else {
    throw `Expected all types to be of type ${type}`;
  }
}

export function getType(type: DataType): DataPrimitive {
  return (typeof type == "string" ? type : type[1]) as DataPrimitive
}

export function fmtType(type: DataType): string {
  return (typeof type == "string" ? type : `${type[0]}<${type[1]}>`) as string
}