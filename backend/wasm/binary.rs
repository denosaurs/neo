macro_rules! binary_impl {
  ($identifier:ident, $type:ty, $closure:expr) => {
    #[no_mangle]
    pub extern "C" fn $identifier(
      len: usize,
      a_data: *const $type,
      b_data: *const $type,
      c_data: *mut $type,
    ) {
      let a_data = &unsafe { core::slice::from_raw_parts(a_data, len) }[..len];
      let b_data = &unsafe { core::slice::from_raw_parts(b_data, len) }[..len];
      let c_data =
        &mut unsafe { core::slice::from_raw_parts_mut(c_data, len) }[..len];

      for i in 0..len {
        c_data[i] = $closure(a_data[i], b_data[i]);
      }
    }
  };
}

binary_impl!(add_f32, f32, |a, b| a + b);
binary_impl!(add_u32, u32, |a, b| unsafe {
  core::intrinsics::unchecked_add(a, b)
});
binary_impl!(add_i32, i32, |a, b| unsafe {
  core::intrinsics::unchecked_add(a, b)
});

binary_impl!(sub_f32, f32, |a, b| a - b);
binary_impl!(sub_u32, u32, |a, b| unsafe {
  core::intrinsics::unchecked_sub(a, b)
});
binary_impl!(sub_i32, i32, |a, b| unsafe {
  core::intrinsics::unchecked_sub(a, b)
});

binary_impl!(mul_f32, f32, |a, b| a * b);
binary_impl!(mul_u32, u32, |a, b| unsafe {
  core::intrinsics::unchecked_mul(a, b)
});
binary_impl!(mul_i32, i32, |a, b| unsafe {
  core::intrinsics::unchecked_mul(a, b)
});

binary_impl!(div_f32, f32, |a, b| a / b);
binary_impl!(div_u32, u32, |a, b| unsafe {
  core::intrinsics::unchecked_div(a, b)
});
binary_impl!(div_i32, i32, |a, b| unsafe {
  core::intrinsics::unchecked_div(a, b)
});

binary_impl!(mod_f32, f32, |a, b| a % b);
binary_impl!(mod_u32, u32, |a, b| unsafe {
  core::intrinsics::unchecked_rem(a, b)
});
binary_impl!(mod_i32, i32, |a, b| unsafe {
  core::intrinsics::unchecked_rem(a, b)
});

binary_impl!(min_f32, f32, |a: f32, b: f32| a.min(b));
binary_impl!(min_u32, u32, |a: u32, b: u32| a.min(b));
binary_impl!(min_i32, i32, |a: i32, b: i32| a.min(b));

binary_impl!(max_f32, f32, |a: f32, b: f32| a.max(b));
binary_impl!(max_u32, u32, |a: u32, b: u32| a.max(b));
binary_impl!(max_i32, i32, |a: i32, b: i32| a.max(b));

binary_impl!(prelu_f32, f32, |a, b| if a < 0.0 { a * b } else { a });
binary_impl!(prelu_i32, i32, |a, b| if a < 0 { a * b } else { a });
