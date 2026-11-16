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

      # what the site reads at build time: the evaluated fosskar.nix
      siteData = pkgs.writeText "site-data.json" (builtins.toJSON { fosskar = import ../fosskar.nix; });

      unwrapped = pkgs.buildNpmPackage {
        pname = "${pname}-unwrapped";
        inherit version;

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

        # the site prints its store path; `website` below swaps in its own
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
      };

      # the cv pages printed to pdf by headless chromium; a local http server
      # is needed because the pages load assets from absolute paths
      cv =
        pkgs.runCommand "${pname}-cv-${version}"
          {
            nativeBuildInputs = [
              pkgs.chromium
              pkgs.python3
            ];
            FONTCONFIG_FILE = pkgs.makeFontsConf { fontDirectories = [ pkgs.dejavu_fonts ]; };
          }
          ''
            export HOME=$TMPDIR
            python3 -m http.server 8080 --bind 127.0.0.1 --directory ${unwrapped} &
            server=$!
            python3 - <<'PY'
            import time, urllib.request
            for _ in range(50):
                try:
                    urllib.request.urlopen("http://127.0.0.1:8080/")
                    break
                except OSError:
                    time.sleep(0.1)
            else:
                raise SystemExit("http server for the cv pdf did not start")
            PY
            mkdir -p $out
            print() {
              chromium --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
                --user-data-dir="$TMPDIR/chromium" --no-pdf-header-footer \
                --virtual-time-budget=5000 --print-to-pdf="$out/$2" "http://127.0.0.1:8080$1"
            }
            print /cv/ cv.pdf
            print /cv/de/ lebenslauf.pdf
            kill $server
          '';

      website = pkgs.runCommand "${pname}-${version}" { passthru = { inherit siteData; }; } ''
        cp -r ${unwrapped} $out
        chmod -R u+w $out
        cp ${cv}/cv.pdf $out/cv/cv.pdf
        cp ${cv}/lebenslauf.pdf $out/cv/de/lebenslauf.pdf
        # the pages show the store path of the site; make it this output's
        find $out -name '*.html' -exec \
          sed -i "s|$(basename ${unwrapped})|$(basename $out)|g" {} +
      '';
    in
    {
      packages = {
        default = website;
        inherit cv;
      };
    };
}
