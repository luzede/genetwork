import axios from "axios";

// Types
export type Post = {
	id: number;
	content: string;
	likes: number;
	username: string;
	profile_url: string;
	created_at: string;
	liked?: 1 | null;
};

export async function newPost(content: string, token: string | null) {
	if (!token) throw new Error("NO_TOKEN");

	const resp = await axios.post<Post>(
		"/api/posts",
		{ content },
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		},
	);
	return resp.data;
}

export async function getPosts(
	username?: string,
	before?: string,
	token?: string | null,
) {
	const resp = await axios.get<Post[]>("/api/posts", {
		headers: {
			Authorization: token ? `Bearer ${token}` : undefined,
		},
		params: {
			username,
			before,
		},
	});
	return resp.data;
}
