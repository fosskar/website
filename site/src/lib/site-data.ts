// data written by nix at build time (nix/package.nix, and the devshell for
// `npm run dev`): the evaluated fosskar.nix and the flake's package names
import data from "../generated/site-data.json";

export interface Fosskar {
  lang: string;
  colorScheme: string;
  name: string;
  role: string;
  location: string;
  likes: string[];
  writing: Record<string, string>;
  work: Record<string, string>;
  contact: Record<string, string>;
}

export const fosskar = data.fosskar as Fosskar;
export const packages = data.packages as Record<string, string>;

/** the store path this build is installed to; only set in `nix build` */
export const storePath: string | undefined = process.env.SITE_STORE_PATH;
