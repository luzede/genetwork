import type { User } from "../../types";

interface Env {
	DB: D1Database;
}

export const onRequestGet: PagesFunction<Env, string> = async (ctx) => {
	try {
		const user = await ctx.env.DB.prepare(
			"SELECT * FROM users WHERE username = ?1",
		)
			.bind(ctx.params.username)
			.first<User>();

		if (!user) {
			return Response.json({ message: "User not found" }, { status: 404 });
		}

		return Response.json({ username: user.username }, { status: 200 });
	} catch (e) {
		return Response.json({ name: e.name, message: e.message }, { status: 500 });
	}
};
