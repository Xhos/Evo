{ pkgs, lib, config, inputs, ... }: {
  packages = [ 
    pkgs.git
    pkgs.docker
  ];
  
  languages.rust.enable = true;

  scripts.docker-build.exec = ''
    docker build -t ghcr.io/xhos/evo:latest .
    docker push ghcr.io/xhos/evo:latest
  '';
}
