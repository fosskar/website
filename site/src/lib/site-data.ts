// data written by nix at build time (nix/package.nix, and the devshell for
// `npm run dev`): the evaluated fosskar.nix
import data from "../generated/site-data.json";
import {
  checkSetting,
  settingTypes,
  type SettingName,
  type Settings,
} from "./fosskar";

export interface Fosskar {
  name: string;
  role: string;
  location: string;
  likes: string[];
  me: Record<string, string>;
  writing: Record<string, string>;
  contact: Record<string, string>;
  website: { settings: Settings };
}

export const fosskar = data.fosskar as Fosskar;

for (const name of Object.keys(settingTypes) as SettingName[]) {
  const error = checkSetting(name, fosskar.website.settings[name]);
  if (error) throw new Error(`fosskar.nix: ${error}`);
}

/** the store path this build is installed to; only set in `nix build` */
export const storePath: string | undefined = process.env.SITE_STORE_PATH;
