# fosskar.nix
{
  name = "simon";
  role = "devops engineer / sre";
  location = "hamburg";
  colorScheme = "dark";

  # kubernetes at work, nixos everywhere else
  likes = [ "nix" "self-hosting" "local llms" "fixing things properly" ];

  writing = {
    blog = "/blog/";
    wiki = "/wiki/";
  };

  work = {
    about = "/about/";
    cv = "/cv/";
    code = "https://github.com/fosskar";
  };

  contact = {
    mail = "simon@nx3.eu";
    matrix = "@fosskar:fosskar.de";
  };
}
