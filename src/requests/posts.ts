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
