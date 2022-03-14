import { DataPrimitive } from "../../types.ts";
import { ensureType } from "../../util.ts";
import { WasmBackend } from "../backend.ts";
import { WasmData } from "../data.ts";

export async function matmul<T extends DataPrimitive>(
  backend: WasmBackend,
  a: WasmData<T>,
  b: WasmData<T>,
  c: WasmData<T>,
  { m, n, k }: { m: number; n: number; k: number },
) {
  const type = ensureType(a.type, b.type);

  await backend.execute({
    func: `matmul_${type}`,
    args: [m, n, k],
    data: [a, b, c],
  });
}
