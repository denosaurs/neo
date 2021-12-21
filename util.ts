export const unstable = typeof Deno.dlopen !== "undefined";
export const webgpu = unstable &&
  typeof navigator.gpu === "object" &&
  typeof navigator.gpu.requestAdapter === "function";
