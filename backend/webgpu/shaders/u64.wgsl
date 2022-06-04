#ignore

/// Compares two u64 (`vec2<u32>`) numbers: `a` and `b`, returning `-1` if `a` is
/// less than `b`, `0` if they are equal and `1` if `a` is larger than `b`
fn cmp_u64(a: vec2<u32>, b: vec2<u32>) -> i32 {
  if (a[0] < b[0]) {
    return -1;
  }

   if (a[0] > b[0]) {
    return 1;
  }

  if (a[1] < b[1]) {
    return -1;
  }

   if (a[1] > b[1]) {
    return 1;
  }

  return 0;
}

/// Checks if two u64 (`vec2<u32>`) numbers are equal
fn eq_u64(a: vec2<u32>, b: vec2<u32>) -> bool {
  return a[0] == b[0] && a[1] == b[1];
}

/// Checks if an u64 (`vec2<u32>`) number is equal to zero
fn eqz_u64(a: vec2<u32>) -> bool {
  return a[0] == 0u && a[1] == 0u;
}

/// Checks if two u64 (`vec2<u32>`) numbers are not equal
fn ne_u64(a: vec2<u32>, b: vec2<u32>) -> bool {
  return a[0] != b[0] || a[1] != b[1];
}

/// Compares two u64 (`vec2<u32>`) numbers and returns
/// true if `a` is less than `b`
fn lt_u64(a: vec2<u32>, b: vec2<u32>) -> bool {
  return cmp_u64(a, b) < 0;
}

/// Compares two u64 (`vec2<u32>`) numbers and returns
/// true if `a` is less than or equal to `b`
fn le_u64(a: vec2<u32>, b: vec2<u32>) -> bool {
  return cmp_u64(a, b) <= 0;
}

/// Compares two u64 (`vec2<u32>`) numbers and returns
/// true if `a` is greater than to `b`
fn gt_u64(a: vec2<u32>, b: vec2<u32>) -> bool {
  return cmp_u64(a, b) > 0;
}

/// Compares two u64 (`vec2<u32>`) numbers and returns
/// true if `a` is greater than or equal to `b`
fn ge_u64(a: vec2<u32>, b: vec2<u32>) -> bool {
  return cmp_u64(a, b) >= 0;
}

/// Performs the bitwise not operation on an u64 (`vec2<u32>`)
fn not_u64(a: vec2<u32>) -> vec2<u32> {
  return ~a;
}

/// Performs the bitwise or operations on two u64 (`vec2<u32>`)
fn or_u64(a: vec2<u32>, b: vec2<u32>) -> vec2<u32> {
  return a | b;
}

/// Performs the bitwise and operations on two u64 (`vec2<u32>`)
fn and_u64(a: vec2<u32>, b: vec2<u32>) -> vec2<u32> {
  return a & b;
}

/// Performs the bitwise xor operations on two u64 (`vec2<u32>`)
fn xor_u64(a: vec2<u32>, b: vec2<u32>) -> vec2<u32> {
  return a ^ b;
}

/// Bitwise shifts left by `n` steps on an u64 (`vec2<u32>`)
fn shl_u64(a: vec2<u32>, n: u32) -> vec2<u32> {
  var r = vec2<u32>(0u, 0u);

  if (n < 32u) {
    r[1] = (a[1] << n) | (a[0] >> (32u - n));
    r[0] = a[0] << n;
  } else {
    r[1] = a[0] << (n - 32u);
    r[0] = 0u;
  }

  return r;
}

/// Bitwise shifts right by `n` steps on an u64 (`vec2<u32>`)
fn shr_u64(a: vec2<u32>, n: u32) -> vec2<u32> {
  var r = vec2<u32>(0u, 0u);

  if (n < 32u) {
    r[1] = a[1] >> n;
    r[0] = (a[1] << (32u - n)) | (a[0] >> n);
  } else {
    r[1] = 0u;
    r[0] = a[1] >> (n - 32u);
  }

  return r;
}

fn cnt_u32(a: u32) -> u32 {
  var cnt = a;
  cnt = cnt - ((cnt >> 1u) & 0x55555555u);
  cnt = (cnt & 0x33333333u) + ((cnt >> 2u) & 0x33333333u);
  cnt = (cnt + (cnt >> 4u)) & 0x0F0F0F0Fu;
  return (cnt * 0x01010101u) >> 24u;
}

/// Counts the number of one bits on an u64 (`vec2<u32>`)
fn cnt_u64(a: vec2<u32>) -> u32 {
  return cnt_u32(a[0]) + cnt_u32(a[1]);
}

// /// Counts the number of one bits on an u64 (`vec2<u32>`)
// fn cnt_u64(a: vec2<u32>) -> u32 {
// let cnt = countOneBits(a);
//   return cnt[0] + cnt[1];
// }
//
// /// Counts the number of leading zeroes on an u64 (`vec2<u32>`)
// fn clz_u64(a: vec2<u32>) -> u32 {
//   let clz = countLeadingZeros(a);
//   return clz[0] + clz[1];
// }
// 
// /// Counts the number of trailing zeroes on an u64 (`vec2<u32>`)
// fn ctz_u64(a: vec2<u32>) -> u32 {
//   let ctz = countTrailingZeros(a);
//   return ctz[0] + ctz[1];
// }

/// Sets a single bit at `n` to the value of `b` in an u64 (`vec2<u32>`)
fn set_bit_u64(a: vec2<u32>, n: u32, b: u32) -> vec2<u32> {
  let o = n % 64u;

  if (o < 32u) {
    return vec2<u32>(insertBits(a[0], b, o, 1u), a[1]);
  }
  return vec2<u32>(a[0], insertBits(a[1], b, o - 32u, 1u));
}

/// Gets a single bit at `n` in an u64 (`vec2<u32>`)
fn get_bit_u64(a: vec2<u32>, n: u32) -> u32 {
  let o = n % 64u;

  if (o < 32u) {
    return extractBits(a[0], o, 1u);
  }
  return extractBits(a[1], o - 32u, 1u);
}

/// Performs an arithmetic addition on two u64 (`vec2<u32>`) numbers
fn add_u64(a: vec2<u32>, b: vec2<u32>) -> vec2<u32> {
  var c = vec2<u32>(0u, 0u);
  
  c[0] = a[0] + b[0];
  c[1] = a[1] + b[1] + u32(c[0] < a[0]);

  return c;
}

/// Performs an arithmetic subtraction on two u64 (`vec2<u32>`) numbers
fn sub_u64(a: vec2<u32>, b: vec2<u32>) -> vec2<u32> {
  var c = vec2<u32>(0u, 0u);
  
  c[0] = a[0] - b[0];
  c[1] = a[1] - b[1] - u32(c[0] > a[0]);

  return c;
}

/// Increments an u64 (`vec2<u32>`) by one
fn inc_u64(a: vec2<u32>) -> vec2<u32> {
  var b = vec2<u32>(0u, 0u);
  
  b[0] = a[0] + 1u;
  b[1] = a[1] + u32(b[0] < a[0]);

  return b;
}

/// Decrements an u64 (`vec2<u32>`) by one
fn dec_u64(a: vec2<u32>) -> vec2<u32> {
  var b = vec2<u32>(0u, 0u);
  
  b[0] = a[0] - 1u;
  b[1] = a[1] - u32(b[0] > a[0]);

  return b;
}

/// Performs an arithmetic multiplication on two `u32` returning an u64 (`vec2<u32>`)
fn mul_u32_u64(a: u32, b: u32) -> vec2<u32> {
  let a1 = a & 0xffffu;
  let a2 = a >> 16u;
  let b1 = b & 0xffffu;
  let b2 = b >> 16u;

  let r1 = a1 * b1;
  let r2 = a1 * b2;
  let r3 = a2 * b1;
  let r4 = a2 * b2;

  let y = r1 + (r2 << 16u);
  let x = y + (r3 << 16u);
  
  return vec2<u32>(x, r4 + (r2 >> 16u) + (r3 >> 16u) + u32(y < r1) + u32(x < y));
}

/// Performs an arithmetic multiplication on two u64 (`vec2<u32>`) numbers
fn mul_u64(a: vec2<u32>, b: vec2<u32>) -> vec2<u32> {
  var r = mul_u32_u64(a[0], b[0]);
  r[1] = r[1] + (a[1] * b[0]) + (a[0] * b[1]);
  return r;
}

/// Calculates the square of an u64 (`vec2<u32>`)
fn sqr_u64(a: vec2<u32>) -> vec2<u32> {
  return mul_u64(a, a);
}

/// Calculates the integer remainder of dividing two u64 (`vec2<u32>`) numbers
fn mod_u64(a: vec2<u32>, b: vec2<u32>) -> vec2<u32> {
  var c = a;
  for (; gt_u64(c, b); c = sub_u64(c, b)) {}

  if (eq_u64(c, b)) {
    return vec2<u32>(0u, 0u);
  }

  return c;
}
