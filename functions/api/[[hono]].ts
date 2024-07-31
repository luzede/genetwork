import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import app from "../../backend";
import type { Bindings } from "../../backend/types";

const hono = new Hono<{ Bindings: Bindings }>();

hono.route("/api", app);

export const onRequest = handle(app);
