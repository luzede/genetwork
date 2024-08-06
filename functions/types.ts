import type { z } from "zod";
import type { imageDetailsSchema } from "./schemas";

export type User = {
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

export type imageDetails = z.infer<typeof imageDetailsSchema>;
