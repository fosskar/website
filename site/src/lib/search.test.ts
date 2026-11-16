import { describe, expect, it } from "vitest";
import { searchItems } from "./search";

const project = (id: string, title: string, order: number, repo?: string) => ({
  id,
  data: { title, description: `${title} desc`, order, repo },
});
const post = (id: string, title: string) => ({ id, data: { title } });
const note = (id: string, title: string) => ({ id, data: { title } });

describe("searchItems", () => {
  const items = searchItems({
    projects: [
      project("b.md", "second", 2),
      project("a.md", "first", 1, "https://github.com/x/first"),
    ],
    posts: [post("hello.md", "hello world")],
    notes: [note("nixos/tpm.md", "tpm unlock")],
  });

  it("lists contact entries first", () => {
    expect(items[0].group).toBe("contact");
  });

  it("orders projects by order and links them to their repo", () => {
    const projects = items.filter((i) => i.group === "projects");
    expect(projects.map((i) => i.title)).toEqual(["first", "second"]);
    expect(projects[0].href).toBe("https://github.com/x/first");
    expect(projects[1].href).toBe("/#work");
    expect(projects[0].hint).toBe("first desc");
  });

  it("routes posts under /blog/ and notes flat under /wiki/", () => {
    expect(items.find((i) => i.group === "blog")?.href).toBe("/blog/hello/");
    expect(items.find((i) => i.group === "wiki")?.href).toBe("/wiki/tpm/");
  });
});
