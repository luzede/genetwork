import axios from "axios";

// Types
type UserUpdate = {
	username: string;
	email: string;
	old_password?: string;
	new_password?: string;
};

type User = {
	username: string;
	email: string;
	profile_url: string;
};

// ####################################################

// Query function to get the current user
export async function getUser(token: string | null) {
	console.log(token, "In getUser");
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

export async function updateUser(values: UserUpdate) {
	const resp = await axios.put<User>("/api/users/me", values, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	});
	return resp.data;
}

export async function getProfile(username: string) {
	const resp = await axios.get<User>(`/api/users/${username}`);
	return resp.data;
}
