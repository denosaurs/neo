import { DataType } from "../../types.ts";
import { prelude } from "./misc.ts";

export const binary = (type: DataType, expr: string) => `
${prelude}

[[block]]
struct Data {
  values: array<${type}>;
};

[[group(0), binding(0)]]
var<storage, read> a_data: Data;
[[group(0), binding(1)]]
var<storage, read> b_data: Data;
[[group(0), binding(2)]]
var<storage, write> c_data: Data;

fn binary(a: ${type}, b: ${type}) -> ${type} {
  ${expr}
}

[[stage(compute), workgroup_size(128)]]
fn main([[builtin(global_invocation_id)]] global_id: vec3<u32>) {
  c_data.values[global_id.x] = binary(a_data.values[global_id.x], b_data.values[global_id.x]);
}
`;
