# website

personal site built with [astro](https://astro.build) and nix. the home page is [`fosskar.nix`](fosskar.nix), shown as it is. the rest is plain markdown in three repo-root directories: `wiki/` (obsidian vault), `blog/` and `projects/`. the astro project is in `site/`, nix modules are in `nix/`.

## dev

```bash
nix develop
cd site && npm run dev     # live preview at localhost:4321
cd site && npm run build   # static site to site/dist/
nix build                  # reproducible site build, with the cv pdfs
nix build .#cv             # only the cv pdfs
```

## update dependencies

```bash
cd site && npm update --package-lock-only
```

the nix build is hash-free: `pkgs.importNpmLock` pins every tarball via the
integrity hashes already committed in `package-lock.json`, so there is no
npmDeps hash to refresh. `site/node_modules` is a read-only nix store symlink.
`--package-lock-only` keeps npm from trying to write into it.
