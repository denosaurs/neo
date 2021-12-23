import { DataType } from "../../types.ts";
import { fmtType } from "../../util.ts";

export const pad = (dataType: DataType) => {
  const type = fmtType(dataType)
  return `
[[block]]
struct Meta {
  w: u32;
  h: u32;
  n: u32;
};

[[block]]
struct Data {
  values: array<${type}>;
};

[[group(0), binding(0)]]
var<storage, read> a: Data;
[[group(0), binding(1)]]
var<storage, write> b: Data;
[[group(0), binding(2)]]
var<storage, read> meta: Meta;

[[stage(compute), workgroup_size(8, 8, 1)]]
fn main([[builtin(global_invocation_id)]] global_id: vec3<u32>) {
  if (global_id.x >= meta.w || global_id.y >= meta.h) {
    return;
  }

  b.values[global_id.x + global_id.y * meta.n] = a.values[global_id.x + global_id.y * meta.w];
}
`};
