import {
  Callable,
  HTTPRequest,
  Image,
  ImageTexture,
  Label,
  Node,
  ResourceLoader,
  SceneNodes,
  Vector2,
} from "godot";
import { User, WSMessage } from "@shared";
import SocketSingleton from "./socket-singleton";
import { createClassBinder } from "godot.annotations";
import Player from "./player";

type GameUser = User;

const bind = createClassBinder<SceneNodes["scenes/Main.tscn"]>();

@bind()
export default class Main extends Node<SceneNodes["scenes/Main.tscn"]> {
  idMap = new Map<string, GameUser>();
  ownUserId: string | undefined;

  @bind.onready("Users")
  userLabel!: Label;

  _ready(): void {
    SocketSingleton._singleton.onMessageReceived.connect(
      Callable.create((wsMessageAsString: string) => {
        const wsMessage: WSMessage = JSON.parse(wsMessageAsString);

        switch (wsMessage.type) {
          case "new-user":
            if (wsMessage.user && wsMessage.user.uuid !== this.ownUserId) {
              this.addUser(wsMessage.user);
            }
            break;
          case "user-left":
            if (wsMessage.sender && this.idMap.has(wsMessage.sender)) {
              this.idMap.delete(wsMessage.sender);
              this.updateUserLabel();
            }
            break;
          case "setup":
            this.ownUserId = wsMessage.sender;
            wsMessage.allUsers.forEach((user) => {
              this.addUser(user);
            });
            break;
          default:
        }
      }),
    );
  }

  addUser(user: User) {
    const httpRequest = new HTTPRequest();
    this.add_sibling(httpRequest);
    httpRequest.request_completed.connect(
      Callable.create((result, responseCode, _headers, body) => {
        const image = new Image();

        // Check magic bytes: PNG starts with [137, 80, 78, 71], JPEG with [255, 216, 255]
        const isJpeg =
          body.get(0) === 255 && body.get(1) === 216 && body.get(2) === 255;

        if (isJpeg) {
          image.load_jpg_from_buffer(body);
        } else {
          image.load_png_from_buffer(body);
        }

        const texture = ImageTexture.create_from_image(image);
        const scene = ResourceLoader.load("res://scenes/Player.tscn");
        const player = scene.instantiate();
        player.init(
          user.uuid === this.ownUserId,
          user.uuid,
          texture,
          user.state?.position,
        );
        this.add_sibling(player);

        this.idMap.set(user.uuid, user);

        this.updateUserLabel();

        httpRequest.queue_free();
      }),
    );
    httpRequest.request(user.avatar);
  }

  updateUserLabel() {
    if (this.userLabel) {
      this.userLabel.text = `Connected Users: \n${Array.from(
        this.idMap.values(),
      )
        .map((user) => `- ${user.username}`)
        .join("\n")}`;
    }
  }
}
