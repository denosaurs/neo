// Do not modify this file!
// This file was automatically generated using `deno task build:wgsl`
// Make changes to `matmul.wgsl` instead and rebuild

import { DataType } from "../../types/data.ts";

export default (type: DataType) => `
  // #import "prelude.wgsl"
  var<private> e: f32 = 2.718281828459045;
  var<private> pi: f32 = 3.141592653589793;
  var<private> tau: f32 = 6.283185307179586;
  var<private> phi: f32 = 1.618033988749895;
  var<private> feigd: f32 = 4.66920160910299;
  var<private> feiga: f32 = -2.5029078750958926;
  var<private> gauss: f32 = 0.8346268416740732;

  // #input type: DataType

  struct Uniform {
    m: u32;
    n: u32;
    k: u32;
  };

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
  var<uniform> meta: Uniform;

  [[stage(compute), workgroup_size(8, 8, 1)]]
  fn main([[builtin(global_invocation_id)]] global_id: vec3<u32>) {
    if (global_id.x >= meta.n || global_id.y >= meta.m) {
      return;
    }

    var sum = ${type}(0);
    for (var k = 0u; k < meta.k; k = k + 1u) {
      sum = sum + a.values[global_id.y * meta.k + k] * b.values[k * meta.n + global_id.x];
    }
    c.values[global_id.x + global_id.y * meta.n] = sum;
  }
`;
