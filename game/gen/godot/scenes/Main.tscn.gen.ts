import Main from "../../../src/main";
declare module "godot" {
    interface ResourceTypes {
        "res://scenes/Main.tscn": PackedScene<Main>;
    }
}
