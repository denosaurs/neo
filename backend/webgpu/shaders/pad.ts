import { DataType } from "../../types.ts";

export const pad = (type: DataType) => `
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
var<storage, read> a_data: Data;
[[group(0), binding(1)]]
var<storage, write> b_data: Data;
[[group(0), binding(2)]]
var<storage, read> meta: Meta;

[[stage(compute), workgroup_size(8, 8, 1)]]
fn main([[builtin(global_invocation_id)]] global_id: vec3<u32>) {
  if (global_id.x >= meta.w || global_id.y >= meta.h) {
    return;
  }

  b_data.values[global_id.x + global_id.y * meta.n] = a_data.values[global_id.x + global_id.y * meta.w];
}
`;
