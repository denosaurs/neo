macro_rules! matmul_impl {
  ($identifier:ident, $type:ty) => {
    #[no_mangle]
    pub extern "C" fn $identifier(
      m: usize,
      n: usize,
      k: usize,
      a_data: *const $type,
      b_data: *const $type,
      c_data: *mut $type,
    ) {
      let a_len = m * k;
      let b_len = k * n;
      let c_len = m * n;
      let a_data =
        &unsafe { core::slice::from_raw_parts(a_data, a_len) }[..a_len];
      let b_data =
        &unsafe { core::slice::from_raw_parts(b_data, b_len) }[..b_len];
      let c_data =
        &mut unsafe { core::slice::from_raw_parts_mut(c_data, c_len) }[..c_len];

      for l_index in 0..m {
        for m_index in 0..k {
          for n_index in 0..n {
            let (i, j, k) = (
              l_index * n + n_index,
              l_index * k + m_index,
              m_index * n + n_index,
            );
            unsafe {
              *c_data.get_unchecked_mut(i) +=
                a_data.get_unchecked(j) * b_data.get_unchecked(k)
            };
          }
        }
      }
    }
  };
}

matmul_impl!(matmul_f32, f32);
matmul_impl!(matmul_u32, u32);
matmul_impl!(matmul_i32, i32);
