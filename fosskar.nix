# fosskar.nix
{
  name = "simon";
  role = "devops engineer / sre";
  location = "hamburg";

  # kubernetes at work, nixos everywhere else
  likes = [
    "nix"
    "self-hosting"
    "local llms"
    "fixing things properly"
  ];

  # about me, my cv (english and german, also as pdf) and my code
  me = {
    about = "./about/";
    cv = "./cv/";
    code = {
      github = "https://github.com/fosskar";
      radicle = "https://radicle.fosskar.eu";
    };
  };

  # side projects
  projects = map (repo: "github:fosskar/${repo}") [
    "nixfiles"
    "ssync"
    "pi-pack"
    "fencr"
    "harbor-labeler"
    "gitops"
  ];

  # longer posts and short notes on problems i solved
  writing = {
    blog = "./blog/";
    wiki = "./wiki/";
  };

  # mail or matrix, whichever you prefer
  contact = {
    mail = "simon@nx3.eu";
    matrix = "@fosskar:fosskar.de";
  };

  # click a value to change it
  website.settings = {
    colorScheme = "dark";
    fontSize = 18;
    typing.enable = true;
    hints.enable = true;
  };
}
