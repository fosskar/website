# Repository Guidelines

## Project Overview

Personal bliki ("half blog, half wiki") published at https://bliki.fosskar.eu. Markdown content is written in an Obsidian vault and rendered by a minimal Astro static site, which Nix builds reproducibly. `CONTEXT.md` is the domain glossary (note, section, wikilink, post, project). Use its vocabulary in code and prose.

## Architecture & Data Flow

Content is stored at the **repo root**, outside the app. `site/src/content.config.ts` loads three collections via glob with `base: "../<dir>"`:

- `wiki/` → notes, routed **flat** as `/wiki/<basename>/` regardless of directory depth (vault-root `wiki/index.md` is the Obsidian home page, excluded via `!index.md`)
- `blog/` → posts at `/blog/<id>/` (drafts filtered)
- `projects/` → listed on the about pages and on `/cv/` (ordered by `order`)

`fosskar.nix` at the repo root is the site's own data (name, role, links, the `lang`/`colorScheme` defaults). `nix/package.nix` evaluates it with `builtins.toJSON` into `site-data.json` together with the package names of the flake; the build copies it to `site/src/generated/`, and the devshell symlinks the same file there for `npm run dev`. The home page shows `fosskar.nix` verbatim, so it is excluded from nixfmt. The build passes its own output path as `SITE_STORE_PATH` for the footer. Each top-level section (`about`, `blog`, `cv`, `wiki`) is also a flake package linking into the built site.

Domain logic is centralized in `site/src/lib/`:

- `notes.ts`: note identity and wikilinks. Contains `slugOf`/`noteHref` (flat routing), `noteSlugIndex()` (basename → slug, Obsidian shortest-path, unique vault-wide), `resolveWikiLink()`, `scanWikiLinks()` (skips code fences), `validateWikiLinks()`, `assertUniqueSlugs()` (collision throws naming both IDs), and the `SECTIONS` record (section descriptions + display order, so vault folders **don't** need a per-directory `index.md`)
- `posts.ts`: publication rules. `published()` filters `draft: true` and sorts newest-first. The blog index, blog routes, RSS, search and the home page hover use it
- `fosskar.ts`: `tokenize()` for showing `fosskar.nix` on the home page, `linkFor()` (paths, urls, mail and matrix ids to hrefs), `typeOf()` for the hover info, and `suggest()` for the 404 page
- `site-data.ts`: typed access to the generated `site-data.json` and `SITE_STORE_PATH`
- `search.ts`: the item list behind the search field and the `⌘K` dialog

Build-time validation fails fast: `astro.config.ts` calls `validateWikiLinks()` and `noteSlugIndex()` at **config load**, and `wiki/[...slug].astro`'s `getStaticPaths` calls `assertUniqueSlugs()`. Broken wikilinks or duplicate basenames fail the build, so they never reach the deployed site.

Wikilinks `[[basename|title]]` resolve via `remark-wiki-link` (configured in `site/astro.config.ts`) to `/wiki/<basename>/`.

## Key Directories

- `wiki/`: Obsidian vault with topic dirs `nixos/` (+ `nixos/security/`), `kubernetes/`, `homelab/`, `security/yubikey/`, `gaming/`
- `blog/`, `projects/`: content collections
- `site/`: Astro app with `src/pages/`, `src/lib/` (domain logic + tests), `src/components/` (`ArticleHead.astro`, `EntryCard.astro`, `Search.astro`, `Cv.astro`, `AboutWork.astro`), `src/layouts/Layout.astro`, `src/content.config.ts`, `astro.config.ts`
- `nix/`: flake modules `package.nix` (site build), `devshell.nix`, `effects.nix` (Hercules CI), `treefmt.nix`, `checks.nix`

## Development Commands

```bash
nix develop                 # devshell: node, node_modules symlinked from nix store
cd site && npm run dev      # live preview at localhost:4321
cd site && npm run build    # static build to site/dist/
cd site && npm test         # vitest run (lib unit tests)
nix build                   # reproducible build (result/ = dist)
nix fmt                     # treefmt: nixfmt + prettier
nix flake check             # builds packages + devshells (does NOT run vitest)
```

Dependency updates: `npm update --package-lock-only` (node_modules is read-only, as README.md explains), then re-enter the devshell.

## Code Conventions & Common Patterns

Wiki note conventions (apply when writing or editing notes under `wiki/`):

- lowercase terse prose. Proper nouns keep case (NixOS, OPNsense, Steam). Open with the reason (why this setup), not a config dump
- `type` implies shape. `guide` = context → steps → verify. `troubleshooting` = symptom → cause → fix. `reference` = annotated list
- every guide ends with `## verify`: one command plus the expected result
- anchor every config block with a comment that states its file/chart/module/UI path. `(this setup)` marks concrete lab values. Pin versions only when actually known and link the upstream issue for workarounds
- placeholders use `<angle-brackets>`. Steam's literal `%command%` is not a placeholder
- cross-link related notes in a reciprocal `## related` footer of `- [[basename|title]]` bullets. External links go in `## references`
- `date` means last verified, not created. Bump it only when a note is actually re-tested
- headings h2/h3 only (the TOC depth filter reads them). Per-note TOC opt-out via `enableToc: false`

Site code:

- TypeScript strict (`astro/tsconfigs/strict`). All config is `.ts` including `astro.config.ts`
- domain logic belongs in `site/src/lib/` with colocated vitest tests (`notes.test.ts`, `posts.test.ts`). Pages don't inline rules: they call `published()`, `noteHref()`, etc.
- shared markup goes in `src/components/` (`ArticleHead` for article headers, `EntryCard` for listings). Don't re-inline card/header markup in pages
- styling is hand-written CSS: the global theme is defined in `Layout.astro` `<style is:global>` as CSS variables on `:root` (dark) and `:root[data-theme="light"]`. `data-theme` defaults to `colorScheme` from `fosskar.nix`, and a choice made on the home page is kept in `localStorage`. Page and component rules go in scoped `<style>` blocks. HTML built as a string (the home page expression, the footer tree) needs global, prefixed selectors, because scoped styles do not reach it. Surfaces are flat: no gradients, blur or scroll animations. The site doesn't use a framework or any integrations beyond sitemap + RSS
- frontmatter schemas are zod in `content.config.ts`. Extend the schema before using a new field

## Important Files

- `site/src/content.config.ts`: collection loaders + schemas (source of truth for frontmatter)
- `site/src/lib/notes.ts`: slug/wikilink/section logic incl. `SECTIONS`. Touch this for anything routing- or link-related
- `site/src/lib/posts.ts`: blog publication rules
- `site/astro.config.ts`: site URL, wikilink resolver, shiki dual themes, cache relocation, build-time wikilink validation
- `site/src/layouts/Layout.astro`: nav, global CSS theme
- `CONTEXT.md`: domain glossary
- `nix/package.nix`: site build. **Trap**: content dirs are whitelisted in a `lib.fileset` union. A new repo-root content dir MUST be added there or `nix build` silently drops it
- `nix/effects.nix`: Hercules CI daily `update-flake-inputs` effect (05:00), which commits as `fosskar[bot]` via the GitToken app secret. This repo doesn't have a deploy effect

## Runtime/Tooling Preferences

- **npm** with committed `package-lock.json`. Nix builds are hash-free via `pkgs.importNpmLock` (no npmDeps hash to refresh)
- node from the devshell (nodejs 24). npm ≥ 11.10 enforces `site/.npmrc` `min-release-age=3`, a 3-day supply-chain cooldown when changing deps. `package.json` engines require node ≥ 22.12
- `site/node_modules` is a **read-only nix store symlink**. Never `npm install` into it, and never let it get git-tracked (the flake source would then contain a broken symlink and astro prerender fails). The astro/vite caches are relocated to `site/.cache/` for this reason
- formatting via `nix fmt` (treefmt: nixfmt + prettier with `embeddedLanguageFormatting = "off"` so prettier doesn't reformat markdown code fences). markdownlint-cli2 and marksman are available in the devshell
- VCS is plain git (`main`, origin = github.com/fosskar/website). Commit messages are `<area>: <description>` lowercase (`site:`, `wiki:`, `nix:`, `docs:`). The repo doesn't use GitHub Actions. CI is Hercules effects only

## Testing & QA

- `cd site && npm test`: vitest unit tests for `src/lib/` (wikilink resolution, slug collision, draft filtering). Run them after touching `lib/`. They are **not** part of `nix flake check`
- `nix flake check` / `nix build`: the build fails on schema violations, duplicate wiki slugs, unresolved wikilinks, and broken frontmatter
- after content edits, `npm run build` in `site/` is the fast check. Inspect `site/dist/` output for rendered wikilinks when touching `## related` footers
- nix edits: run `nix fmt` before committing
