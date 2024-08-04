import axios from "axios";

// Query function to get the current user
export async function getCurrentUser() {
	const resp = await axios.get<{
		username: string;
		email: string;
		profile_url: string;
	}>("/api/users/me", {
		headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	});
	return resp.data;
}

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

export async function updateCurrentUser(values: UserUpdate) {
	const resp = await axios.put<User>("/api/users/me", values, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	});
	return resp.data;
}
