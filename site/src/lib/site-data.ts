// data written by nix at build time (nix/package.nix, and the devshell for
// `npm run dev`): the evaluated fosskar.nix
import data from "../generated/site-data.json";
import {
  checkSetting,
  settingTypes,
  type SettingName,
  type Settings,
} from "./fosskar";

interface Fosskar {
  name: string;
  role: string;
  location: string;
  likes: string[];
  me: { about: string; cv: string; code: { github: string; radicle: string } };
  projects: Record<string, string>;
  writing: Record<string, string>;
  contact: { mail: string; matrix: string };
  website: { settings: Record<string, unknown> };
}

export const fosskar = data.fosskar as Fosskar;

// nix nests `typing.enable` as { typing: { enable } }; the page names a
// setting by its dotted path, as the file writes it
const flat = (
  o: Record<string, unknown>,
  prefix = "",
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === "object"
        ? Object.entries(flat(v as Record<string, unknown>, `${prefix}${k}.`))
        : [[`${prefix}${k}`, v]],
    ),
  );

/** website.settings with dotted names, checked against settingTypes */
export const settings = flat(fosskar.website.settings) as Settings;

for (const name of Object.keys(settingTypes) as SettingName[]) {
  const error = checkSetting(name, settings[name]);
  if (error) throw new Error(`fosskar.nix: ${error}`);
}

/** the store path this build is installed to; only set in `nix build` */
export const storePath: string | undefined = process.env.SITE_STORE_PATH;
