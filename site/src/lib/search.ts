// site search (the ⌘k dialog): one flat list, rendered once into every page
// and filtered client-side.
import { linkFor } from "./fosskar";
import { noteHref, slugOf } from "./notes";
import { postHref, postSlug } from "./posts";

interface SearchItem {
  group: string;
  title: string;
  hint: string;
  href: string;
}

interface Sources {
  projects: {
    id: string;
    data: {
      title: string;
      description: string;
      order: number;
      repo?: string;
    };
  }[];
  /** already published (drafts removed, newest first) */
  posts: { id: string; data: { title: string } }[];
  notes: { id: string; data: { title: string } }[];
  /** contact and me.code from fosskar.nix */
  contact: { mail: string; matrix: string };
  code: string;
}

export function searchItems({
  projects,
  posts,
  notes,
  contact,
  code,
}: Sources): SearchItem[] {
  return [
    {
      group: "contact",
      title: "mail",
      hint: contact.mail,
      href: linkFor(contact.mail)!,
    },
    {
      group: "contact",
      title: "matrix",
      hint: contact.matrix,
      href: linkFor(contact.matrix)!,
    },
    { group: "contact", title: "cv", hint: "printable", href: "/cv/" },
    {
      group: "contact",
      title: "lebenslauf",
      hint: "cv auf deutsch",
      href: "/cv/de/",
    },
    {
      group: "contact",
      title: "github",
      hint: new URL(code).pathname.slice(1),
      href: code,
    },
    { group: "pages", title: "about", hint: "who i am", href: "/about/" },
    ...[...projects]
      .sort((a, b) => a.data.order - b.data.order)
      .map((p) => ({
        group: "projects",
        title: p.data.title,
        hint: p.data.description,
        href: p.data.repo ?? "/about/#projects",
      })),
    ...posts.map((p) => ({
      group: "blog",
      title: p.data.title,
      hint: "",
      href: postHref(p.id),
    })),
    ...notes.map((n) => ({
      group: "wiki",
      title: n.data.title,
      hint: "",
      href: noteHref(n.id),
    })),
  ];
}

/** every page by the name nix would use for it, for "Did you mean …?" */
export function pageNames({
  posts,
  notes,
}: Pick<Sources, "posts" | "notes">): Record<string, string> {
  const names: Record<string, string> = {
    home: "/",
    about: "/about/",
    blog: "/blog/",
    cv: "/cv/",
    wiki: "/wiki/",
  };
  for (const p of posts) names[postSlug(p.id)] = postHref(p.id);
  for (const n of notes) names[slugOf(n.id)] = noteHref(n.id);
  return names;
}
