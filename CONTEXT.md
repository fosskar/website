# domain glossary

terms used by the site code (`site/src/lib/`, pages, config). code and prose
should use these names, not synonyms.

- **note**: one markdown file in `wiki/`. its **slug** is its basename
  (obsidian shortest-path style), unique across the whole vault. notes route
  flat at `/wiki/<slug>/` regardless of directory. identity rules are defined
  in `site/src/lib/notes.ts`.
- **section**: a top-level directory of `wiki/` (nixos, kubernetes, …).
  sections are not pages. they render as anchored cards on the wiki index,
  linked as `/wiki/#<section>`. descriptions are defined in `SECTIONS` in
  `notes.ts`, so folders don't need an `index.md`.
- **wikilink**: an obsidian `[[target|alias]]` link in any content
  collection. targets resolve to note slugs. unresolved targets fail the
  build at config load (`validateWikiLinks`). the vault-root `wiki/index.md`
  is the obsidian home page, not a site page, and is exempt.
- **post**: one markdown file in `blog/`. **published** means not draft,
  listed newest first. a post's url is its id minus `.md` under `/blog/`.
  publication rules are defined in `site/src/lib/posts.ts`.
- **project**: one markdown file in `projects/`, listed on the about pages
  and the cv, ordered by frontmatter `order`. `projects` in `fosskar.nix`
  links the same repos on the home page.
- **site data**: `fosskar.nix` at the repo root, evaluated by nix into
  `site-data.json`. the home page shows the file itself; pages read the json
  through `site/src/lib/site-data.ts`.
- **settings**: `website.settings` in `fosskar.nix`, the values a visitor
  can change on the home page (colour scheme, font size, typing
  animation, hints). each
  has a type in `settingTypes`. a wrong value gets the nixos type error.
- **store path**: the output path of the `website` package. the footer shows
  it.
