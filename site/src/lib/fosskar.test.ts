import { describe, expect, it } from "vitest";
import {
  checkSetting,
  linkFor,
  settingTypes,
  suggest,
  tokenize,
} from "./fosskar";

const src = `# fosskar.nix
{
  lang = "en";
  likes = [
    "nix"
  ];
  contact = {
    mail = "simon@nx3.eu";
  };
  website.settings = {
    fontSize = 16;
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
      "website.settings",
      "fontSize",
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

  it("follows dotted attribute names into the set they open", () => {
    expect(
      flat.find((t) => t.kind === "attr" && t.text === "fontSize")?.path,
    ).toBe("website.settings.fontSize");
    expect(flat.find((t) => t.kind === "number")).toEqual({
      kind: "number",
      text: "16",
      path: "website.settings.fontSize",
    });
  });
});

describe("linkFor", () => {
  it("links site paths, urls, mail addresses and matrix ids", () => {
    expect(linkFor("/blog/")).toBe("/blog/");
    expect(linkFor("./blog/")).toBe("/blog/");
    expect(linkFor("github:fosskar/nixfiles")).toBe(
      "https://github.com/fosskar/nixfiles",
    );
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

describe("suggest", () => {
  it("returns the closest candidates first", () => {
    expect(suggest("blgo", ["wiki", "blog", "about", "cv"])[0]).toBe("blog");
  });

  it("drops candidates that are too far away", () => {
    expect(suggest("zzzzzzzz", ["wiki", "blog"])).toEqual([]);
  });
});

describe("checkSetting", () => {
  it("accepts the values the type allows", () => {
    expect(checkSetting("colorScheme", "light")).toBeUndefined();
    expect(checkSetting("fontSize", 18)).toBeUndefined();
  });

  it("rejects other values with the error nixos would print", () => {
    expect(checkSetting("fontSize", 99)).toBe(
      "A definition for option `website.settings.fontSize' is not of type `integer between 12 and 24 (both inclusive)'. Definition values:\n- In `fosskar.nix': 99",
    );
    expect(checkSetting("colorScheme", "blue")).toContain(
      'is not of type `one of "dark", "light"\'',
    );
    expect(checkSetting("fontSize", 16.5)).toBeDefined();
  });

  it("has a type for every setting", () => {
    expect(Object.keys(settingTypes)).toEqual([
      "colorScheme",
      "font",
      "fontSize",
    ]);
  });
});
