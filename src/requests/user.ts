import axios from "axios";

// Types
export type UserUpdate = {
	username: string;
	email: string;
	old_password?: string;
	new_password?: string;
};

export type User = {
	username: string;
	email: string;
	profile_url: string;
};

// ####################################################

// Query function to get the current user
export async function getUser(token: string | null) {
	// Logging when user is not logged in causes unstoppable trials to connect to the server
	// and prints out messages very fast in rapid succession
	// console.log(token, "In getUser");
	if (!token) throw new Error("No token provided");

	const resp = await axios.get<{
		username: string;
		email: string;
		profile_url: string;
	}>("/api/users/me", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return resp.data;
}

export async function updateUser(values: UserUpdate, token: string | null) {
	const resp = await axios.put<User>("/api/users/me", values, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});
	return resp.data;
}

export async function getProfile(username: string) {
	const resp = await axios.get<User>(`/api/users/${username}`);
	return resp.data;
}
