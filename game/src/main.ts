import { Node, WebSocketPeer } from "godot";
import { WSMessage } from "@shared";

export default class Main extends Node {
  // TODO: Create a singleton to use socket across multiple scenes
  socket!: WebSocketPeer;

  _ready(): void {
    this.socket = new WebSocketPeer();
    const result = this.socket.connect_to_url("ws://localhost:3000");
    console.log("connect result:", result);
  }

  _process() {
    this.socket.poll();
    const state = this.socket.get_ready_state();
    if (state === WebSocketPeer.State.STATE_OPEN) {
      while (this.socket.get_available_packet_count()) {
        const packet = this.socket.get_packet();
        if (this.socket.was_string_packet()) {
          const packetText = packet.get_string_from_utf8();
          const wsMessage: WSMessage = JSON.parse(packetText);
          console.log(packetText);
        }
      }
    }
  }

  send() {
    const state = this.socket.get_ready_state();
    if (state === WebSocketPeer.State.STATE_OPEN) {
      this.socket.send_text("Test packet");
    } else {
      console.log("WebSocket is not open. Current state:", state);
    }
  }
}
