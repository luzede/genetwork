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
	{ user_id: string }
> = async (ctx) => {
	const user_id = ctx.data.user_id;
	try {
		const post = await ctx.env.DB.prepare("SELECT * FROM posts WHERE id = ?1")
			.bind(ctx.params.id)
			.first<Post>();
		if (post.owner !== user_id) {
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

export const onRequestPut: PagesFunction<
	Env,
	string,
	{ user_id: string }
> = async (ctx) => {
	try {
		const body = await ctx.request.json<
			{ type: "LIKE" | "DISLIKE" } | undefined
		>();
		if (!body || ["LIKE", "DISLIKE"].indexOf(body.type) === -1) {
			return Response.json({ message: "Invalid type" }, { status: 422 });
		}

		if (body.type === "LIKE") {
			// Insertion will throw an error if the user has already liked the post
			// because it will violate either primary key constraint or foreign key constraint
			await ctx.env.DB.prepare(
				"INSERT INTO user_likes_post (user_id, post_id) VALUES (?1, ?2)",
			)
				.bind(ctx.data.user_id, ctx.params.id)
				.run();
			await ctx.env.DB.prepare(
				"UPDATE posts SET likes = likes + 1 WHERE id = ?1",
			)
				.bind(ctx.params.id)
				.run();

			return Response.json({ message: "LIKED" }, { status: 200 });
		}

		const resp = await ctx.env.DB.prepare(
			"DELETE FROM user_likes_post WHERE user_id = ?1 AND post_id = ?2",
		)
			.bind(ctx.data.user_id, ctx.params.id)
			.run();

		if (!resp.meta.changed_db) {
			return Response.json({ message: "NOT_LIKED" }, { status: 409 });
		}
		await ctx.env.DB.prepare("UPDATE posts SET likes = likes - 1 WHERE id = ?1")
			.bind(ctx.params.id)
			.run();

		return Response.json({ message: "DISLIKED" }, { status: 200 });
	} catch (e) {
		if (e instanceof SyntaxError) {
			return Response.json(
				{ name: e.name, message: e.message },
				{ status: 422 },
			);
		}
		return Response.json(
			{ message: "There was an error executing like/dislike action" },
			{ status: 500 },
		);
	}
};
