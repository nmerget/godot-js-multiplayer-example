import { Node, Signal, WebSocketPeer } from "godot";
import { WSMessage } from "@shared";
import { createClassBinder } from "godot.annotations";

const bind = createClassBinder();

@bind()
export default class SocketSingleton extends Node {
  static _singleton: SocketSingleton;

  socket!: WebSocketPeer;

  @bind.signal()
  accessor onMessageReceived!: Signal<(wsMessageAsString: string) => void>;

  static get singleton() {
    return SocketSingleton._singleton;
  }

  constructor() {
    super();
    if (!SocketSingleton._singleton) {
      SocketSingleton._singleton = this;
    }
  }

  _ready(): void {
    this.socket = new WebSocketPeer();
    this.socket.connect_to_url("ws://localhost:3000/ws");
  }

  _process() {
    this.socket.poll();
    const state = this.socket.get_ready_state();
    if (state === WebSocketPeer.State.STATE_OPEN) {
      while (this.socket.get_available_packet_count()) {
        const packet = this.socket.get_packet();
        if (this.socket.was_string_packet()) {
          const wsMessageAsString = packet.get_string_from_utf8();
          this.onMessageReceived.emit(wsMessageAsString);
        }
      }
    }
  }

  send(wsMessage: WSMessage) {
    const state = this.socket.get_ready_state();
    if (state === WebSocketPeer.State.STATE_OPEN) {
      this.socket.send_text(JSON.stringify(wsMessage));
    } else {
      console.log("WebSocket is not open. Current state:", state);
    }
  }
}
