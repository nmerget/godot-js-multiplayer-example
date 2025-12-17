import type { WSContext } from "hono/ws";

declare module "hono/ws" {
  interface WSContext<T> {
    uuid?: string;
    username?: string;
    avatar?: string;
  }
}
