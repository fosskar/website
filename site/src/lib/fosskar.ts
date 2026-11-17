// fosskar.nix on the page: a small tokenizer for highlighting and linking
// the source, plus the helpers the home page and the 404 page share.
// the data itself comes from src/generated/site-data.json, written by nix.

interface Token {
  kind: "comment" | "string" | "number" | "bool" | "attr" | "punct" | "text";
  text: string;
  /** dotted attribute path of an attr name or of the value it holds */
  path?: string;
}

const patterns: [Token["kind"], RegExp][] = [
  ["comment", /^#.*/],
  ["string", /^"(?:\\.|[^"\\])*"/],
  ["attr", /^[A-Za-z_][\w'-]*(?:\.[A-Za-z_][\w'-]*)*(?=\s*=)/],
  ["number", /^\d+(?=\s*;)/],
  ["bool", /^(?:true|false)(?=\s*;)/],
  ["punct", /^[{}[\];=]/],
  ["text", /^\s+|^[^\s"#{}[\];=]+/],
];

/** split nix source into lines of tokens; only the subset fosskar.nix uses */
export function tokenize(src: string): Token[][] {
  const scope: string[] = [];
  let current: string | null = null;
  const pathOf = (name?: string) =>
    [...scope, ...(name ? [name] : current ? [current] : [])].join(".") ||
    undefined;

  return src.split("\n").map((line) => {
    const tokens: Token[] = [];
    let rest = line;
    while (rest) {
      const [kind, re] = patterns.find(([, re]) => re.test(rest))!;
      const text = rest.match(re)![0];
      rest = rest.slice(text.length);
      if (kind === "attr") {
        current = text;
        tokens.push({ kind, text, path: pathOf(text) });
        continue;
      }
      if (kind === "punct") {
        if (text === "{" && current) {
          scope.push(current);
          current = null;
        } else if (text === "}") {
          scope.pop();
        } else if (text === ";") {
          current = null;
        }
      }
      tokens.push(
        kind === "string" || kind === "number" || kind === "bool"
          ? { kind, text, path: pathOf() }
          : { kind, text },
      );
    }
    return tokens;
  });
}

/** website.settings: the values a visitor can change, typed like nixos options */
export const settingTypes = {
  colorScheme: { enum: ["dark", "light", "system"] },
  fontSize: { min: 12, max: 24 },
  "typing.enable": { bool: true },
  "hints.enable": { bool: true },
} as const;

export type SettingName = keyof typeof settingTypes;
export type Settings = Record<SettingName, string | number | boolean>;

/** the type the way nixos describes it, e.g. `one of "dark", "light"` */
function describeType(name: SettingName): string {
  const t = settingTypes[name];
  if ("bool" in t) return "boolean";
  return "enum" in t
    ? `one of ${t.enum.map((v) => `"${v}"`).join(", ")}`
    : `integer between ${t.min} and ${t.max} (both inclusive)`;
}

/** the nixos type error for an invalid value, undefined if it's valid */
export function checkSetting(
  name: SettingName,
  value: unknown,
): string | undefined {
  const t = settingTypes[name];
  const ok =
    "bool" in t
      ? typeof value === "boolean"
      : "enum" in t
        ? (t.enum as readonly unknown[]).includes(value)
        : Number.isInteger(value) &&
          (value as number) >= t.min &&
          (value as number) <= t.max;
  if (ok) return undefined;
  const shown = typeof value === "string" ? `"${value}"` : String(value);
  return `A definition for option \`website.settings.${name}' is not of type \`${describeType(name)}'. Definition values:\n- In \`fosskar.nix': ${shown}`;
}

/** where a value should link to, if anywhere */
export function linkFor(value: string): string | undefined {
  if (value.startsWith("/")) return value;
  // relative to the home page, the only page that shows fosskar.nix
  if (value.startsWith("./")) return value.slice(1);
  if (/^https?:\/\//.test(value)) return value;
  // a flake reference, as in `nix build github:owner/repo`
  const flake = value.match(/^github:([\w.-]+\/[\w.-]+)$/);
  if (flake) return `https://github.com/${flake[1]}`;
  if (/^[^@\s]+@[^@\s]+\.[a-z]+$/i.test(value)) return `mailto:${value}`;
  if (/^@[^:\s]+:\S+$/.test(value)) return `https://matrix.to/#/${value}`;
  return undefined;
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]!;
      row[j] = Math.min(
        row[j]! + 1,
        row[j - 1]! + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return row[b.length]!;
}

/** candidates close enough to `target` to be what was meant, nearest first */
export function suggest(
  target: string,
  candidates: string[],
  max = 3,
): string[] {
  return candidates
    .map((c) => ({ c, d: distance(target.toLowerCase(), c.toLowerCase()) }))
    .filter(({ c, d }) => d <= Math.max(2, Math.floor(c.length / 2)))
    .sort((a, b) => a.d - b.d)
    .slice(0, max)
    .map(({ c }) => c);
}

/** "Did you mean …?" as nix words it, with each candidate as a link */
export function didYouMean(
  hits: string[],
  hrefs: Record<string, string>,
): (string | HTMLAnchorElement)[] {
  const links = hits.map((h) => {
    const a = document.createElement("a");
    a.href = hrefs[h]!;
    a.textContent = h;
    return a;
  });
  return [
    "Did you mean ",
    ...(links.length === 1 ? [] : ["one of "]),
    ...links.flatMap((a, i) => [
      ...(i === 0 ? [] : [i === links.length - 1 ? " or " : ", "]),
      a,
    ]),
    "?",
  ];
}
