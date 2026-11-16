{
  perSystem =
    { pkgs, lib, ... }:
    let
      astroSrc = lib.fileset.toSource {
        root = ../.;
        fileset = lib.fileset.unions [
          (lib.fileset.difference ../site (
            lib.fileset.unions [
              (lib.fileset.maybeMissing ../site/node_modules)
              (lib.fileset.maybeMissing ../site/dist)
              (lib.fileset.maybeMissing ../site/src/generated)
            ]
          ))
          ../blog
          ../projects
          ../wiki
          ../fosskar.nix
        ];
      };

      pname = "website";
      version = "0.1.0";

      # each section of the built site is also its own package, so
      # `nix flake show` lists the real sitemap and `nix build .#blog` works
      sections = [
        "about"
        "blog"
        "cv"
        "wiki"
      ];

      # what the site reads at build time: the evaluated fosskar.nix and the
      # package names for the sitemap; names come from the variables above so
      # building the data never forces the site derivation
      siteData = pkgs.writeText "site-data.json" (
        builtins.toJSON {
          fosskar = import ../fosskar.nix;
          packages = {
            default = "${pname}-${version}";
          }
          // lib.genAttrs sections (s: "${pname}-${s}");
        }
      );

      site = pkgs.buildNpmPackage {
        inherit pname version;

        src = astroSrc;
        sourceRoot = "${astroSrc.name}/site";

        # hash-free: every tarball is pinned by the integrity hashes
        # already committed in package-lock.json
        npmDeps = pkgs.importNpmLock { npmRoot = ../site; };
        npmConfigHook = pkgs.importNpmLock.npmConfigHook;

        env.ASTRO_TELEMETRY_DISABLED = "1";

        preBuild = ''
          mkdir -p src/generated
          cp ${siteData} src/generated/site-data.json
        '';

        # the site prints its own store path in the footer
        buildPhase = ''
          runHook preBuild
          SITE_STORE_PATH=$out npm run build
          runHook postBuild
        '';

        installPhase = ''
          runHook preInstall
          cp -r dist $out
          runHook postInstall
        '';

        passthru = { inherit siteData; };
      };
    in
    {
      packages = {
        default = site;
      }
      // lib.genAttrs sections (s: pkgs.runCommand "${pname}-${s}" { } "ln -s ${site}/${s} $out");
    };
}
