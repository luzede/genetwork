import type { z } from "zod";
import type { imageDetailsSchema } from "./schemas";

export type User = {
	id: string;
	username: string;
	email: string;
	password_hash: string;
	profile_url: string | null;
	created_at: string;
};

export type UserUpdate = {
	username: string;
	email: string;
	old_password?: string;
	new_password?: string;
};

export type Post = {
	id: number;
	content: string;
	owner: string;
	likes: number;
	created_at: string;
};

export type PostJoinedUser = {
	id: number;
	content: string;
	owner: string;
	likes: number;
	created_at: string;
	username: string;
	password_hash: string;
	email: string;
	profile_url: string;
	liked?: 1 | null;
};

export type PostFE = {
	id: number;
	content: string;
	likes: number;
	username: string;
	profile_url: string;
	created_at: string;
	liked?: 1 | null;
};

export type imageDetails = z.infer<typeof imageDetailsSchema>;
