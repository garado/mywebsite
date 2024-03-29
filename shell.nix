{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell
{
  nativeBuildInputs = with pkgs; [
    hugo
  ];

  shellHook = ''
    echo -e "\e[31mEntering development environment for Hugo Static Site Generator\e[0m"
  '';
}
