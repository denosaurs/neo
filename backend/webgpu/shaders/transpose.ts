import { DataType } from "../../types.ts";
import { prelude } from "./misc.ts";

export const transpose = (type: DataType) => {
  return `
${prelude}

struct Uniform {
  w: u32;
  h: u32;
};

struct Data {
  values: array<${type}>;
};

[[group(0), binding(0)]]
var<storage, read> a: Data;
[[group(0), binding(1)]]
var<storage, write> b: Data;
[[group(0), binding(2)]]
var<uniform> meta: Uniform;

[[stage(compute), workgroup_size(8, 8, 1)]]
fn main([[builtin(global_invocation_id)]] global_id: vec3<u32>) {
  if (global_id.x >= meta.w || global_id.y >= meta.h) {
    return;
  }

  b.values[global_id.y + global_id.x * meta.h] = a.values[global_id.x + global_id.y * meta.w];
}
`};
