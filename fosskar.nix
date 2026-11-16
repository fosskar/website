# fosskar.nix
{
  name = "simon";
  role = "devops engineer / sre";
  location = "hamburg";

  # kubernetes at work, nixos everywhere else
  likes = [ "nix" "self-hosting" "local llms" "fixing things properly" ];

  me = {
    about = "/about/";
    cv = "/cv/";
    code = "https://github.com/fosskar";
  };

  writing = {
    blog = "/blog/";
    wiki = "/wiki/";
  };

  contact = {
    mail = "simon@nx3.eu";
    matrix = "@fosskar:fosskar.de";
  };

  # click a value to change it
  website.settings = {
    colorScheme = "dark";
    accent = "teal";
    font = "inter";
    fontSize = 18;
  };
}
