{
  perSystem =
    { pkgs, config, ... }:
    let
      # nodejs_24 ships npm >= 11.10, which enforces min-release-age (site/.npmrc)
      nodejs = pkgs.nodejs_24;
      nodeModules = pkgs.importNpmLock.buildNodeModules {
        npmRoot = ../site;
        inherit nodejs;
      };
    in
    {
      devShells.default = pkgs.mkShell {
        name = "wiki";
        buildInputs = [
          nodejs
          pkgs.markdownlint-cli2
          pkgs.marksman
        ];

        shellHook = ''
          root="$(${pkgs.git}/bin/git rev-parse --show-toplevel)"
          ln -sfn ${nodeModules}/node_modules "$root/site/node_modules"
          # same evaluated fosskar.nix the nix build copies in
          mkdir -p "$root/site/src/generated"
          ln -sfn ${config.packages.default.siteData} "$root/site/src/generated/site-data.json"
          echo "wiki dev environment (node_modules provided by nix)"
          echo "  cd site && npm run dev      - live preview at localhost:4321"
          echo "  cd site && npm run build    - static site to site/dist/"
          echo "  nix build                   - reproducible site build"
        '';
      };
    };
}
