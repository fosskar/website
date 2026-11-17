import { getCollection } from "astro:content";
import { published } from "../lib/posts";
import { searchItems } from "../lib/search";
import { fosskar } from "../lib/site-data";

// fetched by the search dialog when it first opens, so pages don't carry it
export async function GET() {
  const items = searchItems({
    projects: await getCollection("projects"),
    posts: published(await getCollection("blog")),
    notes: await getCollection("wiki"),
    contact: fosskar.contact,
    code: fosskar.me.code,
  });
  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json" },
  });
}
