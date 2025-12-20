import Player from "../../../src/player";
declare module "godot" {
    interface ResourceTypes {
        "res://scenes/Player.tscn": PackedScene<Player>;
    }
}
