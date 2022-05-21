import { encode } from "https://deno.land/std@0.140.0/encoding/base64.ts";
import { compress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";

const name = Deno.args[0];
const output = Deno.args[1];

await Deno.run({
  cmd: ["cargo", "build", "--release", "--target", "wasm32-unknown-unknown"],
}).status();

const wasm = await Deno.readFile(
  `./target/wasm32-unknown-unknown/release/${name}.wasm`,
);
const encoded = encode(compress(wasm));
const js = `// deno-fmt-ignore-file\n// deno-lint-ignore-file
import { decode } from "https://deno.land/std@0.137.0/encoding/base64.ts";
import { decompress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";
export const source = decompress(decode("${encoded}"));`;

await Deno.writeTextFile(output, js);
