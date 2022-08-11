struct Meta {
  m: u32;
  n: u32;
  k: u32;
};

struct Data {
  values: array<i32>;
};

struct Data2 {
  values: array<vec2<f32>>;
};

struct Data3 {
  values: array<f32>;
};

[[group(0), binding(0)]]
var<storage, read> a: Data;
[[group(0), binding(1)]]
var<storage, read> b: Data2;
[[group(0), binding(2)]]
var<storage, write> c: Data3;
[[group(0), binding(3)]]
var<storage, read> meta: Meta;

fn lerp(a: f32, b: f32, x: f32) -> f32 {
  return a + (b - a) * x;
};

fn fade(t: f32) -> f32 {
  return ((6.0 * t - 15.0) * t + 10.0) * t * t * t;
};

fn perlin2D(posX: f32, posY: f32) -> f32 {
  let batchX = i32(floor(posX / f32(meta.k)));
  let batchY = i32(floor(posY / f32(meta.k)));
  
  let trp = a.values[a.values[batchX + 1] + batchY + 1];
  let tlp = a.values[a.values[batchX] + batchY + 1];
  let brp = a.values[a.values[batchX + 1] + batchY];
  let blp = a.values[a.values[batchX] + batchY];

  let trv = b.values[u32(trp % 3)];
  let tlv = b.values[u32(tlp % 3)];
  let brv = b.values[u32(brp % 3)];
  let blv = b.values[u32(blp % 3)];

  let x = posX / f32(meta.k) - f32(batchX);
  let y = posY / f32(meta.k) - f32(batchY);

  let tr = vec2<f32>(x - 1.0, y - 1.0);
  let tl = vec2<f32>(x, y - 1.0);
  let br = vec2<f32>(x - 1.0, y);
  let bl = vec2<f32>(x, y);

  let trd = dot(trv, tr);
  let tld = dot(tlv, tl);
  let brd = dot(brv, br);
  let bld = dot(blv, bl);

  let u = fade(x);
  let v = fade(y);

  let left = lerp(bld, tld, v);
  let right = lerp(brd, trd, v);
  return lerp(left, right, u);
};

[[stage(compute), workgroup_size(8, 8, 1)]]
fn main([[builtin(global_invocation_id)]] global_id: vec3<u32>) {
  if (global_id.x >= meta.n || global_id.y >= meta.m) {
    return;
  }
  
  let idx = global_id.x + global_id.y * meta.n;
  let perlin = perlin2D(f32(global_id.y), f32(global_id.x));
  c.values[idx] = perlin;
}
