export type User = {
  uuid: string;
  name: string;
};

export type UserWithSocket = User & {
  ws: any;
};

export type WSMessage =
  | { type: "new-user"; sender?: string; user?: User }
  | { type: "message"; sender?: string; payload?: string }
  | { type: "user-left"; sender?: string; payload?: string }
  | { type: "setup"; sender?: string; allUsers: User[] };
