import { z } from "zod";
import * as jose from "jose";

import { verifyPassword } from "../../utils";
import type { User } from "../../types";
import { loginSchema } from "../../schemas";

interface Env {
	DB: D1Database;
	JWT_SECRET: string;
	JWT_EXPIRATION: string;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
	try {
		const body = await ctx.request.json();

		const data = loginSchema.parse(body);

		const user = await ctx.env.DB.prepare(
			"SELECT * FROM users WHERE username = ?1",
		)
			.bind(data.username)
			.first<User>();

		if (!user) {
			return Response.json({ message: "Invalid credentials" }, { status: 401 });
		}

		const passwordMatch = await verifyPassword(
			user.password_hash,
			data.password,
		);

		if (!passwordMatch) {
			return Response.json({ message: "Invalid credentials" }, { status: 401 });
		}

		// Encodes into a Uint8Array only
		const encoder = new TextEncoder();

		const token = await new jose.SignJWT()
			.setSubject(user.username)
			.setExpirationTime(ctx.env.JWT_EXPIRATION)
			.setProtectedHeader({ alg: "HS256" })
			.sign(encoder.encode(ctx.env.JWT_SECRET));

		// Returns the token to the client
		return Response.json({ token }, { status: 200 });
	} catch (e) {
		if (e instanceof SyntaxError) {
			return Response.json(
				{ name: e.name, message: e.message },
				{ status: 422 },
			);
		}
		if (e instanceof z.ZodError) {
			return Response.json(
				{ name: e.name, message: e.message },
				{ status: 422 },
			);
		}
		return Response.json({ name: e.name, message: e.message }, { status: 500 });
	}
};
