import {
  basename,
  dirname,
  globToRegExp,
  parse,
  resolve,
} from "https://deno.land/std@0.140.0/path/mod.ts";
import { walk } from "https://deno.land/std@0.140.0/fs/mod.ts";
import { createTypeScript, preprocess } from "./wgsl_preprocess.ts";

const glob = globToRegExp(Deno.args[0]);

for await (
  const { path } of walk("./", {
    includeDirs: false,
    includeFiles: true,
    match: [glob],
    exts: ["wgsl"],
  })
) {
  console.log(`Preprocessing ${path}`);

  const output = resolve(
    Deno.args[1] ?? dirname(path),
    `${parse(path).name}.ts`,
  );
  const result = await preprocess(path);

  if (!result.ignore) {
    console.log(`Writing ${output}`);
    const source = createTypeScript(result);
    await Deno.writeTextFile(
      output,
      "// Do not modify this file!\n" +
        "// This file was automatically generated using `deno task build:wgsl`\n" +
        `// Make changes to \`${basename(path)}\` instead and rebuild\n\n` +
        source,
    );
  }
}
