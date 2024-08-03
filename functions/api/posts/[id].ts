import type { Post } from "../../types";

interface Env {
	DB: D1Database;
}

export const onRequestGet: PagesFunction<Env, string> = async (ctx) => {
	try {
		const post = await ctx.env.DB.prepare("SELECT * FROM posts WHERE id = ?1")
			.bind(ctx.params.id)
			.first<Post>();
		if (!post) {
			return Response.json({ message: "Post not found" }, { status: 404 });
		}
		return Response.json(post);
	} catch (e) {
		return Response.json({ name: e.name, message: e.message }, { status: 500 });
	}
};

export const onRequestDelete: PagesFunction<
	Env,
	string,
	{ username: string }
> = async (ctx) => {
	const username = ctx.data.username;
	try {
		const post = await ctx.env.DB.prepare("SELECT * FROM posts WHERE id = ?1")
			.bind(ctx.params.id)
			.first<Post>();
		if (post.owner !== username) {
			return Response.json("You cannot delete someone else's post", {
				status: 403,
			});
		}
		await ctx.env.DB.prepare("DELETE FROM posts WHERE id = ?1")
			.bind(ctx.params.id)
			.run();
		return Response.json({ message: "Post deleted" }, { status: 204 });
	} catch (e) {
		return Response.json({ message: "Post not found" }, { status: 404 });
	}
};
