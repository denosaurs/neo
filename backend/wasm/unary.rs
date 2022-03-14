macro_rules! unary_impl {
  ($identifier:ident, $type:ty, $closure:expr) => {
    #[no_mangle]
    pub extern "C" fn $identifier(
      len: usize,
      a_data: *const $type,
      b_data: *mut $type,
    ) {
      let a_data = &unsafe { core::slice::from_raw_parts(a_data, len) }[..len];
      let b_data =
        &mut unsafe { core::slice::from_raw_parts_mut(b_data, len) }[..len];

      for i in 0..len {
        b_data[i] = $closure(a_data[i]);
      }
    }
  };
}

unary_impl!(abs_f32, f32, |a: f32| if a < 0.0 { -a } else { a });
unary_impl!(abs_i32, i32, |a: i32| if a < 0 { -a } else { a });

unary_impl!(linear_f32, f32, |a| a);
unary_impl!(linear_u32, u32, |a| a);
unary_impl!(linear_i32, i32, |a| a);

unary_impl!(neg_f32, f32, |a: f32| -a);
unary_impl!(neg_i32, i32, |a: i32| -a);

unary_impl!(inc_f32, f32, |a| a + 1.0);
unary_impl!(inc_u32, u32, |a| a + 1);
unary_impl!(inc_i32, i32, |a| a + 1);

unary_impl!(dec_f32, f32, |a| a - 1.0);
unary_impl!(dec_u32, u32, |a| a - 1);
unary_impl!(dec_i32, i32, |a| a - 1);

unary_impl!(relu_f32, f32, |a: f32| a.max(0.0));
unary_impl!(relu_i32, i32, |a: i32| a.max(0));

unary_impl!(relu6_f32, f32, |a: f32| a.clamp(0.0, 6.0));
unary_impl!(relu6_i32, i32, |a: i32| a.clamp(0, 6));

unary_impl!(ceil_f32, f32, |a: f32| unsafe {
  core::intrinsics::ceilf32(a)
});
unary_impl!(floor_f32, f32, |a: f32| unsafe {
  core::intrinsics::floorf32(a)
});
unary_impl!(round_f32, f32, |a: f32| unsafe {
  core::intrinsics::roundf32(a)
});
unary_impl!(sqrt_f32, f32, |a: f32| unsafe {
  core::intrinsics::sqrtf32(a)
});
unary_impl!(rsqrt_f32, f32, |a: f32| 1.0
  / unsafe { core::intrinsics::sqrtf32(a) });
unary_impl!(sigmoid_f32, f32, |a: f32| 1.0
  / (1.0 + unsafe { core::intrinsics::expf32(-1.0 * a) }));

unary_impl!(square_f32, f32, |a| a * a);
unary_impl!(square_u32, u32, |a| a * a);
unary_impl!(square_i32, i32, |a| a * a);

unary_impl!(cos_f32, f32, |a: f32| unsafe {
  core::intrinsics::cosf32(a)
});
unary_impl!(cosh_f32, f32, |a: f32| {
  let e2x = unsafe { core::intrinsics::expf32(-a) };
  return (e2x + 1.0 / e2x) / 2.0;
});

unary_impl!(sin_f32, f32, |a: f32| unsafe {
  core::intrinsics::sinf32(a)
});
unary_impl!(sinh_f32, f32, |a: f32| {
  let e2x = unsafe { core::intrinsics::expf32(a) };
  return (e2x - 1.0 / e2x) / 2.0;
});

unary_impl!(tan_f32, f32, |a: f32| unsafe {
  core::intrinsics::sinf32(a) / core::intrinsics::cosf32(a)
});
unary_impl!(tanh_f32, f32, |a: f32| {
  let e2x =
    unsafe { core::intrinsics::expf32(-2.0 * if a < 0.0 { -a } else { a }) };
  return if a.is_nan() {
    f32::NAN
  } else if a.is_sign_negative() {
    -1.0
  } else {
    1.0
  } * (1.0 - e2x)
    / (1.0 + e2x);
});

unary_impl!(exp_f32, f32, |a: f32| unsafe {
  core::intrinsics::expf32(a)
});

unary_impl!(elu_f32, f32, |a: f32| if a >= 0.0 {
  a
} else {
  unsafe { core::intrinsics::expf32(a) - 1.0 }
});

unary_impl!(log_f32, f32, |a: f32| if a < 0.0 {
  f32::INFINITY
} else {
  unsafe { core::intrinsics::logf32(a) }
});
