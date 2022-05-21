import {
  dirname,
  relative,
  resolve,
} from "https://deno.land/std@0.140.0/path/mod.ts";

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const inputTypeLookupType: Record<string, string> = {
  "DataPrimitive": "backend/types/data.ts",
  "DataDimension": "backend/types/data.ts",
  "DataVec": "backend/types/data.ts",
  "DataMat": "backend/types/data.ts",
  "DataType": "backend/types/data.ts",
} as const;

const ignoreDirective = /#ignore/g;
const importDirective = /#import\s"((?:[^"\\]|\\.)*)"/g;
const inputDirective = /#input\s(\w+):\s([^\n]+)/g;

export interface PreprocessResult {
  wgsl: string;
  ignore: boolean;
  imports: Record<string, Set<string>>;
  inputs: Record<string, string>;
}

export async function preprocess(source: string): Promise<PreprocessResult> {
  const processing = [];
  const result: PreprocessResult = {
    wgsl: await Deno.readTextFile(source),
    ignore: false,
    imports: {},
    inputs: {},
  };

  result.ignore = ignoreDirective.test(result.wgsl);
  result.wgsl = result.wgsl.replaceAll(ignoreDirective, "");

  const imports = result.wgsl.matchAll(importDirective);
  for (const [match, file] of imports) {
    processing.push((async () => {
      // TODO: fix circular imports and duplicate imports
      const processed = await preprocess(resolve(dirname(source), file));
      result.wgsl = result.wgsl.replace(
        match,
        `// ${match}\n${processed.wgsl}`,
      );

      for (const [name, type] of Object.entries(processed.inputs)) {
        result.inputs[name] = type;
      }
    })());
  }

  await Promise.all(processing);

  const inputs = result.wgsl.matchAll(inputDirective);
  for (const [match, name, type] of inputs) {
    if (name in result.inputs && result.inputs[name] !== type) {
      throw new TypeError(
        `Mismatched input types for ${name}, type ${type} does not match ${
          result.inputs[name]
        }`,
      );
    }
    result.inputs[name] = type;
    result.wgsl = result.wgsl.replace(match, `// ${match}`);
    result.wgsl = result.wgsl.replace(
      new RegExp(`(#\\w*\\s)?\\b${escapeRegExp(name)}\\b`, "g"),
      (value, directive) => {
        if (directive !== undefined) {
          return value;
        }

        return `\${${name}}`;
      },
    );
  }

  for (const type of Object.values(result.inputs)) {
    for (let [external, path] of Object.entries(inputTypeLookupType)) {
      path = relative(dirname(source), path);
      if (type.includes(external)) {
        result.imports[path] ??= new Set();
        result.imports[path].add(external);
      }
    }
  }

  result.wgsl = result.wgsl.trim() + "\n";
  return result;
}

export function createTypeScript(result: PreprocessResult): string {
  const imports = Object.entries(result.imports);
  return `${
    imports.length >= 1
      ? Object.entries(result.imports).map(([path, types]) =>
        `import { ${[...types.values()].join(", ")} } from "${
          path.replaceAll("\\", "/")
        }";\n`
      ).join("") + "\n"
      : ""
  }export default (${
    Object.entries(result.inputs).map(([name, type]) => `${name}: ${type}`)
      .join(", ")
  }) => \`\n${result.wgsl.replaceAll(/.+\n/g, "  $&")}\`;\n`;
}
