// deno-lint-ignore no-explicit-any
export function isConstructor(f: any): boolean {
  try {
    Reflect.construct(String, [], f);
  } catch {
    return false;
  }
  return true;
}
