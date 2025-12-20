import {
  Callable,
  CharacterBody2D,
  ImageTexture,
  Input,
  ProjectSettings,
  SceneNodes,
  TextureRect,
  Variant,
  Vector2,
} from "godot";
import { createClassBinder } from "godot.annotations";
import SocketSingleton from "./socket-singleton";
import { PlayerPosition, WSMessage } from "@shared";

const jump_velocity = -400;

// Get the gravity from the project settings to be synced with RigidBody nodes.
const gravity = <number>(
  ProjectSettings.get_setting("physics/2d/default_gravity")
);

const bind = createClassBinder();

@bind()
export default class Player extends CharacterBody2D<
  SceneNodes["scenes/Player.tscn"]
> {
  @bind.export(Variant.Type.TYPE_FLOAT)
  accessor speed: number = 300;

  userPlayer: boolean = false;
  userId: string = "";
  imageTexture: ImageTexture | undefined;

  lastJump: boolean = false;
  lastDirection: number = 0;

  init(
    userPlayer: boolean,
    userId: string,
    imageTexture: ImageTexture,
    position?: PlayerPosition,
  ): void {
    this.userPlayer = userPlayer;
    this.userId = userId;
    this.imageTexture = imageTexture;

    if (position) {
      this.global_position = new Vector2(position.x, position.y);
      return;
    }
  }

  _ready(): void {
    const rect: TextureRect = this.get_node("TextureRect");
    if (rect && this.imageTexture) {
      rect.texture = this.imageTexture;
    }

    SocketSingleton._singleton.onMessageReceived.connect(
      Callable.create((wsMessageAsString: string) => {
        const wsMessage: WSMessage = JSON.parse(wsMessageAsString);
        const { type, sender } = wsMessage;
        if (sender === this.userId && !this.userPlayer) {
          if (type === "player-state") {
            this.lastJump = wsMessage.state?.jump || false;
            this.lastDirection = wsMessage.state?.direction || 0;
          } else if (wsMessage.type === "user-left") {
            this.queue_free();
          }
        }
      }),
    );
  }

  shouldJump(): boolean {
    if (this.userPlayer) {
      return Input.is_action_just_pressed("ui_accept");
    } else {
      return this.lastJump;
    }
  }

  getDirection(): number {
    if (this.userPlayer) {
      return Input.get_axis("ui_left", "ui_right");
    } else {
      return this.lastDirection;
    }
  }

  _physics_process(delta: number): void {
    let velocity = this.velocity;
    let jump = false;

    // Add the gravity.
    if (!this.is_on_floor()) {
      velocity.y += gravity * delta;
    }

    // Handle Jump.
    if (this.shouldJump() && this.is_on_floor()) {
      velocity.y = jump_velocity;
      jump = true;
    }

    let direction = this.getDirection();

    if (
      this.userPlayer &&
      (this.lastJump !== jump || this.lastDirection !== direction)
    ) {
      this.lastJump = jump;
      this.lastDirection = direction;
      SocketSingleton._singleton.send({
        type: "player-state",
        state: {
          jump,
          direction,
          position: { x: this.global_position.x, y: this.global_position.y },
        },
      });
    }

    velocity.x = direction * this.speed;

    this.velocity = velocity;
    this.move_and_slide();
  }
}
