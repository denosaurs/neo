import { DataType } from "../../types.ts";
import { fmtType } from "../../util.ts";
import { prelude } from "./misc.ts";

export const unary = (dataType: DataType, expr: string) => {
  const type = fmtType(dataType)
  return `
${prelude}

struct Data {
  values: array<${type}>;
};

[[group(0), binding(0)]]
var<storage, read> a_data: Data;
[[group(0), binding(1)]]
var<storage, write> b_data: Data;

fn unary(a: ${type}) -> ${type} {
  ${expr}
}

[[stage(compute), workgroup_size(128)]]
fn main([[builtin(global_invocation_id)]] global_id: vec3<u32>) {
  b_data.values[global_id.x] = unary(a_data.values[global_id.x]);
}
`};
