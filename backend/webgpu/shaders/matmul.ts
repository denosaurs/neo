import { DataType } from "../../types.ts";

export const matmul = (type: DataType) => `
[[block]]
struct Meta {
  m: u32;
  n: u32;
  k: u32;
};

[[block]]
struct Data {
  values: array<${type}>;
};

[[group(0), binding(0)]]
var<storage, read> a: Data;
[[group(0), binding(1)]]
var<storage, read> b: Data;
[[group(0), binding(2)]]
var<storage, write> c: Data;
[[group(0), binding(3)]]
var<storage, read> meta: Meta;

[[stage(compute), workgroup_size(8, 8, 1)]]
fn main([[builtin(global_invocation_id)]] global_id: vec3<u32>) {
  if (global_id.x >= meta.n || global_id.y >= meta.m) {
    return;
  }

  var sum = 0${type};
  for (var k = 0u; k < meta.k; k = k + 1u) {
    sum = sum + a.values[global_id.y * meta.k + k] * b.values[k * meta.n + global_id.x];
  }
  c.values[global_id.x + global_id.y * meta.n] = sum;
}
`;
