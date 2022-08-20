#import "prelude.wgsl"
#input type: DataType

struct Uniforms {
  m: u32,
  n: u32,
  k: u32,
};

struct Data {
  values: array<type>,
};

@group(0) @binding(0)
var<storage, read> a: Data;
@group(0) @binding(1)
var<storage, read> b: Data;
@group(0) @binding(2)
var<storage, write> c: Data;
@group(0) @binding(3)
var<uniform> uniforms: Uniforms;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  if (global_id.x >= uniforms.n || global_id.y >= uniforms.m) {
    return;
  }

  var sum = type(0);
  for (var k = 0u; k < uniforms.k; k = k + 1u) {
    sum = sum + a.values[global_id.y * uniforms.k + k] * b.values[k * uniforms.n + global_id.x];
  }
  c.values[global_id.x + global_id.y * uniforms.n] = sum;
}
