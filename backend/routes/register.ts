import { Hono } from "hono";
import type { Bindings } from "../types";

const router = new Hono<{ Bindings: Bindings }>();

router.post("/", async (c) => {
	console.log(c);
	return c.json({ message: "Hello, World!" });
});

export default router;
