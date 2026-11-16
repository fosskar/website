// data written by nix at build time (nix/package.nix, and the devshell for
// `npm run dev`): the evaluated fosskar.nix
import data from "../generated/site-data.json";

export interface Fosskar {
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

/** the store path this build is installed to; only set in `nix build` */
export const storePath: string | undefined = process.env.SITE_STORE_PATH;
