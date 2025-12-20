declare module "godot" {
    interface SceneNodes {
        "scenes/Main.tscn": {
            Users: Label<{}>;
            Ground: StaticBody2D<
                {
                    Polygon2D: Polygon2D<{}>;
                    CollisionPolygon2D: CollisionPolygon2D<{}>;
                }
            >;
        };
    }
}
