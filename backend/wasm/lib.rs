#![no_std]
#![feature(default_alloc_error_handler)]

extern crate alloc;
extern crate wee_alloc;

pub use neo_rust;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[cfg(not(test))]
const DEFAULT_PANIC: &str = "Panic occured";

#[cfg(not(test))]
extern "C" {
  fn panic(ptr: *const u8, len: usize);
}

#[cfg(not(test))]
#[panic_handler]
#[no_mangle]
fn panic_handler(panic_info: &core::panic::PanicInfo) -> ! {
  let msg = *panic_info
    .payload()
    .downcast_ref::<&str>()
    .unwrap_or(&DEFAULT_PANIC);
  let ptr = msg.as_ptr();
  let len = msg.len();

  unsafe { panic(ptr, len) };

  loop {}
}

#[no_mangle]
pub unsafe fn alloc(size: usize) -> *mut u8 {
  let align = core::mem::align_of::<usize>();
  let layout = alloc::alloc::Layout::from_size_align_unchecked(size, align);
  alloc::alloc::alloc(layout)
}

#[no_mangle]
pub unsafe fn dealloc(ptr: *mut u8, size: usize) {
  let align = core::mem::align_of::<usize>();
  let layout = alloc::alloc::Layout::from_size_align_unchecked(size, align);
  alloc::alloc::dealloc(ptr, layout);
}
