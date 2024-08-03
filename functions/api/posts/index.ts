import { z } from "zod";

import type { Post } from "../../types";

interface Env {
	DB: D1Database;
}

const postSchema = z.object({
	content: z.string().min(1).max(300),
});

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
	try {
		if (ctx.request.headers.get("content-type") !== "application/json") {
			const posts = await ctx.env.DB.prepare("SELECT * FROM posts").run<Post>();
			return Response.json(posts.results);
		}

		const { username } = await ctx.request.json<{ username?: string }>();
		if (username) {
			const user_posts = await ctx.env.DB.prepare(
				"SELECT * FROM posts WHERE posts.owner = ?1",
			)
				.bind(username)
				.all<Post>();
			return Response.json(user_posts);
		}

		const posts = await ctx.env.DB.prepare("SELECT * FROM posts").run<Post>();
		return Response.json(posts.results);
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

export const onRequestPost: PagesFunction<
	Env,
	string,
	{ username: string }
> = async (ctx) => {
	const username = ctx.data.username;

	try {
		const body = await ctx.request.json();
		const data = postSchema.parse(body);

		await ctx.env.DB.prepare(
			"INSERT INTO posts (content, owner) VALUES (?1, ?2)",
		)
			.bind(data.content, username)
			.run();

		return Response.json({ message: "Post created" }, { status: 201 });
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
