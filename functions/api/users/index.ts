import type { User } from "types";
import { z } from "zod";

interface Env {
	DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
	const url = new URL(ctx.request.url);
	const params = new URLSearchParams(url.search);

	try {
		const q = params.get("q") || "";
		const users = await ctx.env.DB.prepare(
			"SELECT * FROM users WHERE username LIKE ?1",
		)
			.bind(`${q}%`)
			.all<User>();

		return Response.json(
			users.results.map(
				(u) => ({
					username: u.username,
					email: u.email,
					profile_url: u.profile_url,
				}),
				{ status: 200 },
			),
		);
	} catch (e) {
		console.log(e);
		return Response.json({ name: e.name, message: e.message }, { status: 500 });
	}
};
