// site search (header ⌘k and the home hero): one flat list, rendered once
// into every page and filtered client-side.
import { noteHref } from "./notes";
import { postHref } from "./posts";

export interface SearchItem {
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
}

export function searchItems({ projects, posts, notes }: Sources): SearchItem[] {
  return [
    {
      group: "contact",
      title: "mail",
      hint: "simon@nx3.eu",
      href: "mailto:simon@nx3.eu",
    },
    {
      group: "contact",
      title: "matrix",
      hint: "@fosskar:fosskar.de",
      href: "https://matrix.to/#/@fosskar:fosskar.de",
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
      hint: "fosskar",
      href: "https://github.com/fosskar",
    },
    {
      group: "pages",
      title: "what i do",
      hint: "what i love and what i do",
      href: "/about/",
    },
    { group: "pages", title: "about", hint: "who i am", href: "/about/" },
    ...[...projects]
      .sort((a, b) => a.data.order - b.data.order)
      .map((p) => ({
        group: "projects",
        title: p.data.title,
        hint: p.data.description,
        href: p.data.repo ?? "/#work",
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
