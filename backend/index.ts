import { Hono } from "hono";

import registerRouter from "./routes/register";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.route("/register", registerRouter);

export default app;
