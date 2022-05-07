macro_rules! unary_operator {
  ($identifier:ident, $type:ty, $closure:expr) => {
    #[no_mangle]
    pub extern "C" fn $identifier(
      a_data: *const $type,
      b_data: *mut $type,
      len: usize,
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

unary_operator!(abs_f32, f32, |a: f32| if a < 0.0 { -a } else { a });
unary_operator!(abs_i32, i32, |a: i32| if a < 0 { -a } else { a });

unary_operator!(linear_f32, f32, |a| a);
unary_operator!(linear_u32, u32, |a| a);
unary_operator!(linear_i32, i32, |a| a);

unary_operator!(neg_f32, f32, |a: f32| -a);
unary_operator!(neg_i32, i32, |a: i32| -a);

unary_operator!(inc_f32, f32, |a| a + 1.0);
unary_operator!(inc_u32, u32, |a| a + 1);
unary_operator!(inc_i32, i32, |a| a + 1);

unary_operator!(dec_f32, f32, |a| a - 1.0);
unary_operator!(dec_u32, u32, |a| a - 1);
unary_operator!(dec_i32, i32, |a| a - 1);

unary_operator!(relu_f32, f32, |a: f32| a.max(0.0));
unary_operator!(relu_i32, i32, |a: i32| a.max(0));

unary_operator!(relu6_f32, f32, |a: f32| a.clamp(0.0, 6.0));
unary_operator!(relu6_i32, i32, |a: i32| a.clamp(0, 6));

unary_operator!(ceil_f32, f32, |a: f32| unsafe {
  core::intrinsics::ceilf32(a)
});
unary_operator!(floor_f32, f32, |a: f32| unsafe {
  core::intrinsics::floorf32(a)
});
unary_operator!(round_f32, f32, |a: f32| unsafe {
  core::intrinsics::roundf32(a)
});
unary_operator!(sqrt_f32, f32, |a: f32| unsafe {
  core::intrinsics::sqrtf32(a)
});
unary_operator!(rsqrt_f32, f32, |a: f32| 1.0
  / unsafe { core::intrinsics::sqrtf32(a) });
unary_operator!(sigmoid_f32, f32, |a: f32| 1.0
  / (1.0 + unsafe { core::intrinsics::expf32(-1.0 * a) }));

unary_operator!(square_f32, f32, |a| a * a);
unary_operator!(square_u32, u32, |a| a * a);
unary_operator!(square_i32, i32, |a| a * a);

unary_operator!(cos_f32, f32, |a: f32| unsafe {
  core::intrinsics::cosf32(a)
});
unary_operator!(cosh_f32, f32, |a: f32| {
  let e2x = unsafe { core::intrinsics::expf32(-a) };
  return (e2x + 1.0 / e2x) / 2.0;
});

unary_operator!(sin_f32, f32, |a: f32| unsafe {
  core::intrinsics::sinf32(a)
});
unary_operator!(sinh_f32, f32, |a: f32| {
  let e2x = unsafe { core::intrinsics::expf32(a) };
  return (e2x - 1.0 / e2x) / 2.0;
});

unary_operator!(tan_f32, f32, |a: f32| unsafe {
  core::intrinsics::sinf32(a) / core::intrinsics::cosf32(a)
});
unary_operator!(tanh_f32, f32, |a: f32| {
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

unary_operator!(exp_f32, f32, |a: f32| unsafe {
  core::intrinsics::expf32(a)
});

unary_operator!(elu_f32, f32, |a: f32| if a >= 0.0 {
  a
} else {
  unsafe { core::intrinsics::expf32(a) - 1.0 }
});

unary_operator!(log_f32, f32, |a: f32| if a < 0.0 {
  f32::INFINITY
} else {
  unsafe { core::intrinsics::logf32(a) }
});
