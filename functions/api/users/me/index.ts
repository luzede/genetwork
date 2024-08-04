import * as jose from "jose";
import type { User } from "../../../types";

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
