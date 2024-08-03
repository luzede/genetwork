export type User = {
	username: string;
	email: string;
	password_hash: string;
	created_at: string;
	updated_at: string;
};

export type Post = {
	id: number;
	content: string;
	owner: string;
	likes: number;
	created_at: string;
};
