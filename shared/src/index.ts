export type User = {
  uuid: string;
  username: string;
  avatar: string;
  state?: PlayerState;
};

export type PlayerPosition = {
    x: number;
    y: number;
}

export type PlayerState = {
  jump: boolean;
  direction: number;
  position: PlayerPosition;
};

export type WSMessage =
  | { type: "new-user"; sender?: string; user?: User }
  | { type: "player-state"; sender?: string; state?: PlayerState }
  | { type: "user-left"; sender?: string; payload?: string }
  | { type: "setup"; sender?: string; allUsers: User[] };
