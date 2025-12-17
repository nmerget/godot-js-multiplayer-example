import {
  Callable,
  HTTPRequest,
  Label,
  Node,
  SceneNodes,
  TextureRect,
  Image,
  ImageTexture,
  Vector2,
} from "godot";
import { User, WSMessage } from "@shared";
import SocketSingleton from "./socket-singleton";

type GameUser = User & {
  textureRect?: TextureRect;
};

export default class Main extends Node<SceneNodes["scenes/Main.tscn"]> {
  idMap = new Map<string, GameUser>();
  ownUserId: string | undefined;

  userLabel: Label | undefined;

  _ready(): void {
    this.userLabel = this.get_node("Users");

    SocketSingleton._singleton.onMessageReceived.connect(
      Callable.create((wsMessageAsString: string) => {
        console.log("Received message from server: ", wsMessageAsString);
        const wsMessage: WSMessage = JSON.parse(wsMessageAsString);

        switch (wsMessage.type) {
          case "message":
            console.log("Message payload: ", wsMessage.payload);
            break;
          case "new-user":
            if (wsMessage.user && wsMessage.user.uuid !== this.ownUserId) {
              this.addUser(wsMessage.user);
              console.log("New user joined: ", wsMessage.user);
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
        const textureRect = new TextureRect();

        textureRect.texture = texture;
        textureRect.expand_mode = TextureRect.ExpandMode.EXPAND_IGNORE_SIZE;
        textureRect.size = new Vector2(100, 100);
        textureRect.position = new Vector2(
          Math.random() * 500,
          Math.random() * 500,
        );
        this.add_sibling(textureRect);
        this.idMap.set(user.uuid, { ...user, textureRect });

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

  sendDummyMessage() {
    SocketSingleton._singleton.send({
      type: "message",
      payload: "Hello from Main!",
    });
  }
}
