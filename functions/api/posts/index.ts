import { z } from "zod";

import type { Post, PostFE, PostJoinedUser } from "../../types";

interface Env {
	DB: D1Database;
}

const postSchema = z.object({
	content: z.string().min(1).max(400),
});

export const postsBodySchema = z
	.object({
		username: z.string().min(3).max(30).nullish(),
		before: z.string().datetime().nullish(),
	})
	.nullish();

// This needs to change to return usernames and profile urls
export const onRequestGet: PagesFunction<
	Env,
	undefined,
	{ user_id: string }
> = async (ctx) => {
	try {
		const url = new URL(ctx.request.url);

		const params = new URLSearchParams(url.search);

		const { username, before } = postsBodySchema.parse({
			username: params.get("username"),
			before: params.get("before"),
		});
		const cDate = new Date(Date.now()).toISOString();
		let date = `${cDate.substring(0, 10)} ${cDate.substring(11, 19)}`;
		if (before) {
			date = `${before.substring(0, 10)} ${before.substring(11, 19)}`;
		}

		// IF USER IS NOT LOGGED IN
		if (!ctx.data.user_id) {
			if (username) {
				const user_posts = await ctx.env.DB.prepare(
					"SELECT posts.*, users.username, users.profile_url FROM posts INNER JOIN users ON posts.owner = users.id AND users.username = ?1 AND posts.created_at < ?2 ORDER BY posts.created_at DESC LIMIT 20",
				)
					.bind(username, date)
					.all<PostJoinedUser>();
				return Response.json(
					user_posts.results.map<PostFE>((entry) => ({
						id: entry.id,
						content: entry.content,
						likes: entry.likes,
						username: entry.username,
						profile_url: entry.profile_url,
						created_at: entry.created_at,
					})),
				);
			}

			const posts = await ctx.env.DB.prepare(
				"SELECT posts.*, users.username, users.profile_url FROM posts INNER JOIN users ON posts.owner = users.id AND posts.created_at < ?1 ORDER BY posts.created_at DESC LIMIT 20",
			)
				.bind(date)
				.run<PostJoinedUser>();

			return Response.json(
				posts.results.map<PostFE>((entry) => ({
					id: entry.id,
					content: entry.content,
					likes: entry.likes,
					username: entry.username,
					profile_url: entry.profile_url,
					created_at: entry.created_at,
				})),
			);
		}

		if (username) {
			const user_posts = await ctx.env.DB.prepare(
				"SELECT p.*, ulp.post_id = p.id as liked FROM (SELECT posts.*, users.username, users.profile_url FROM posts INNER JOIN users ON posts.owner = users.id AND users.username = ?1 AND posts.created_at < ?2 ORDER BY posts.created_at DESC LIMIT 20) AS p LEFT JOIN user_likes_post AS ulp ON p.id = ulp.post_id AND ulp.user_id = ?3",
			)
				.bind(username, date, ctx.data.user_id)
				.all<PostJoinedUser>();
			return Response.json(
				user_posts.results.map<PostFE>((entry) => ({
					id: entry.id,
					content: entry.content,
					likes: entry.likes,
					username: entry.username,
					profile_url: entry.profile_url,
					created_at: entry.created_at,
					liked: entry.liked,
				})),
			);
		}

		const posts = await ctx.env.DB.prepare(
			"SELECT p.*, ulp.post_id = p.id as liked FROM (SELECT posts.*, users.username, users.profile_url FROM posts INNER JOIN users ON posts.owner = users.id AND posts.created_at < ?1 ORDER BY posts.created_at DESC LIMIT 20) AS p LEFT JOIN user_likes_post AS ulp ON p.id = ulp.post_id AND ulp.user_id = ?2",
		)
			.bind(date, ctx.data.user_id)
			.run<PostJoinedUser>();

		return Response.json(
			posts.results.map<PostFE>((entry) => ({
				id: entry.id,
				content: entry.content,
				likes: entry.likes,
				username: entry.username,
				profile_url: entry.profile_url,
				created_at: entry.created_at,
				liked: entry.liked,
			})),
		);
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
	{ user_id: string }
> = async (ctx) => {
	const user_id = ctx.data.user_id;

	try {
		const body = await ctx.request.json();
		const data = postSchema.parse(body);

		await ctx.env.DB.prepare(
			"INSERT INTO posts (content, owner) VALUES (?1, ?2)",
		)
			.bind(data.content, user_id)
			.run();

		const post = await ctx.env.DB.prepare(
			"SELECT posts.*, users.username, users.profile_url FROM posts INNER JOIN users ON posts.owner = users.id WHERE users.id = ?1 ORDER BY posts.id DESC LIMIT 1",
		)
			.bind(user_id)
			.first<PostJoinedUser>();

		const postFE: PostFE = {
			id: post.id,
			content: post.content,
			likes: post.likes,
			username: post.username,
			profile_url: post.profile_url,
			created_at: post.created_at,
			liked: null,
		};

		return Response.json(postFE, { status: 201 });
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
