macro_rules! transpose_operator {
  ($identifier:ident, $type:ty) => {
    #[no_mangle]
    pub unsafe extern "C" fn $identifier(
      w: usize,
      h: usize,
      a_data: *const $type,
      b_data: *mut $type,
    ) {
      let len = w * h;
      let a_data = &core::slice::from_raw_parts(a_data, len)[..len];
      let b_data = &mut core::slice::from_raw_parts_mut(b_data, len)[..len];

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
