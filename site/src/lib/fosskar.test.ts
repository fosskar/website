import { describe, expect, it } from "vitest";
import { linkFor, suggest, tokenize, typeOf } from "./fosskar";

const src = `# fosskar.nix
{
  lang = "en";
  likes = [
    "nix"
  ];
  contact = {
    mail = "simon@nx3.eu";
  };
}`;

describe("tokenize", () => {
  const lines = tokenize(src);
  const flat = lines.flat();

  it("keeps one token list per source line", () => {
    expect(lines).toHaveLength(src.split("\n").length);
    expect(lines.map((l) => l.map((t) => t.text).join(""))).toEqual(
      src.split("\n"),
    );
  });

  it("marks comments, attribute names and strings", () => {
    expect(flat.find((t) => t.kind === "comment")?.text).toBe("# fosskar.nix");
    expect(flat.filter((t) => t.kind === "attr").map((t) => t.text)).toEqual([
      "lang",
      "likes",
      "contact",
      "mail",
    ]);
  });

  it("gives names and values their attribute path, nested sets included", () => {
    const attr = (text: string) =>
      flat.find((t) => t.kind === "attr" && t.text === text);
    const str = (text: string) =>
      flat.find((t) => t.kind === "string" && t.text === text);
    expect(attr("mail")?.path).toBe("contact.mail");
    expect(str('"simon@nx3.eu"')?.path).toBe("contact.mail");
    expect(str('"nix"')?.path).toBe("likes");
    expect(str('"en"')?.path).toBe("lang");
  });
});

describe("linkFor", () => {
  it("links site paths, urls, mail addresses and matrix ids", () => {
    expect(linkFor("/blog/")).toBe("/blog/");
    expect(linkFor("https://github.com/fosskar")).toBe(
      "https://github.com/fosskar",
    );
    expect(linkFor("simon@nx3.eu")).toBe("mailto:simon@nx3.eu");
    expect(linkFor("@fosskar:fosskar.de")).toBe(
      "https://matrix.to/#/@fosskar:fosskar.de",
    );
  });

  it("leaves plain words alone", () => {
    expect(linkFor("hamburg")).toBeUndefined();
    expect(linkFor("devops engineer / sre")).toBeUndefined();
  });
});

describe("typeOf", () => {
  it("names values the way nix does", () => {
    expect(typeOf("simon")).toBe("string");
    expect(typeOf(["a", "b"])).toBe("list of string, 2 elements");
    expect(typeOf({ blog: "/blog/" })).toBe("attrset, 1 attribute");
  });
});

describe("suggest", () => {
  it("returns the closest candidates first", () => {
    expect(suggest("blgo", ["wiki", "blog", "about", "cv"])[0]).toBe("blog");
  });

  it("drops candidates that are too far away", () => {
    expect(suggest("zzzzzzzz", ["wiki", "blog"])).toEqual([]);
  });
});
