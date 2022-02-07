// Todo!

// import { WebGPUBackend } from "../backend/webgpu/backend.ts";
// import { WebGPUData } from "../backend/webgpu/data.ts";
// import { reduce } from "../backend/webgpu/operators/reduce.ts";

// const backend = new WebGPUBackend();
// await backend.initialize();

// // deno-fmt-ignore
// const a = await WebGPUData.from<"f32">(
//   backend,
//   new Float32Array(1238).fill(123),
// );

// console.log(await reduce("return p + c;")(backend, a));

// // what about https://www.w3.org/TR/WGSL/#atomic-type
// // Probably a good idea, but then again, no idea how to use it lol
