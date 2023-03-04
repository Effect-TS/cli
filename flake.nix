{
  inputs = {
    nixpkgs = {
      url = "github:nixos/nixpkgs/nixpkgs-unstable";
    };
  };

  outputs = {
    self,
    nixpkgs,
    ...
  }: let
    # Helper generating outputs for each desired system
    forAllSystems = nixpkgs.lib.genAttrs [
      "x86_64-darwin"
      "x86_64-linux"
      "aarch64-darwin"
      "aarch64-linux"
    ];

    pkgsFor = system: nixpkgs.legacyPackages.${system};
  in {
    formatter = forAllSystems (
      system: let
        pkgs = pkgsFor system;
      in
        pkgs.alejandra
    );

    devShells = forAllSystems (system: let
      pkgs = pkgsFor system;
    in {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs-16_x
          nodePackages.pnpm
        ];
      };
    });
  };
}
