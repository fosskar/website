import { describe, expect, it } from "vitest";
import { published } from "./posts";

const post = (id: string, date: string, draft = false) => ({
  id,
  data: { draft, date: new Date(date) },
});

describe("published", () => {
  it("drops drafts and sorts the rest newest first", () => {
    const posts = [
      post("old.md", "2024-01-01"),
      post("future-draft.md", "2026-12-31", true),
      post("new.md", "2025-06-15"),
      post("mid.md", "2024-08-20"),
    ];
    expect(published(posts).map((p) => p.id)).toEqual([
      "new.md",
      "mid.md",
      "old.md",
    ]);
  });
});
