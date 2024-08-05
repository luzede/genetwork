import * as jose from "jose";
import { z } from "zod";
import type { UserUpdate, User } from "../../../types";
import { settingsSchema } from "../../../schemas";

interface Env {
	DB: D1Database;
}

export const onRequestGet: PagesFunction<
	Env,
	undefined,
	{ username: string }
> = async (ctx) => {
	// We don't need to verify if the user exists because it is guaranteed
	// since JWT are only given to those who have an account

	const user = await ctx.env.DB.prepare(
		"SELECT * FROM users WHERE username = ?1",
	)
		.bind(ctx.data.username)
		.first<User>();
	return Response.json({
		username: user.username,
		email: user.email,
		profile_url: user.profile_url,
	});
};

export const onRequestPut: PagesFunction<
	Env,
	undefined,
	{ username: string }
> = async (ctx) => {
	try {
		const body = await ctx.request.json<UserUpdate>();
		const data = settingsSchema.parse(body);

		const user = await ctx.env.DB.prepare(
			"SELECT * FROM users WHERE username = ?1",
		)
			.bind(ctx.data.username)
			.first<User>();

		if (data.username !== user.username) {
			const username = await ctx.env.DB.prepare(
				"SELECT username FROM users WHERE username = ?1",
			)
				.bind(data.username)
				.first<User>();
			if (username) {
				return Response.json(
					{ message: "Username already exists" },
					{ status: 409 },
				);
			}
		}

		if (data.email !== user.email) {
			const email = await ctx.env.DB.prepare(
				"SELECT * FROM users WHERE email = ?1",
			)
				.bind(data.email)
				.first<User>();
			if (email) {
				return Response.json(
					{ message: "Email already exists" },
					{ status: 409 },
				);
			}
		}

		await ctx.env.DB.prepare(
			"UPDATE users SET username = ?1, email = ?2 WHERE username = ?3",
		)
			.bind(data.username, data.email, ctx.data.username)
			.run();

		return Response.json({ message: "User updated" }, { status: 200 });
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
