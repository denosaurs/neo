macro_rules! transpose_operator {
  ($identifier:ident, $type:ty) => {
    #[no_mangle]
    pub extern "C" fn $identifier(
      a_data: *const $type,
      b_data: *mut $type,
      w: usize,
      h: usize,
    ) {
      let len = w * h;
      let a_data = &unsafe { core::slice::from_raw_parts(a_data, len) }[..len];
      let b_data = &mut unsafe { core::slice::from_raw_parts_mut(b_data, len) }[..len];

      for x in 0..w {
        for y in 0..h {
          b_data[y + x * h] = a_data[x + y * w];
        }
      }
    }
  };
}

transpose_operator!(transpose_f32, f32);
transpose_operator!(transpose_u32, u32);
transpose_operator!(transpose_i32, i32);
