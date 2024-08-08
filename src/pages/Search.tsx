// Hooks and other utilities
import { useState } from "react";
import axios from "axios";

// Components
import { SearchIcon, UserIcon } from "lucide-react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

// Types
import type { User } from "@/requests/user";

export default function Search() {
	const [users, setUsers] = useState<User[]>([]);
	const [search, setSearch] = useState("");
	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		clearTimeout(timeoutId);
		const id = setTimeout(async () => {
			try {
				const resp = await axios.get<User[]>("/api/users", {
					params: {
						q: e.target.value,
					},
				});
				setUsers(resp.data);
			} catch (e) {
				console.log(e);
			}
		}, 1000);
		setTimeoutId(id);
	};

	return (
		<Card className="w-full max-w-lg mx-auto border-0 sm:border">
			<CardHeader>
				<CardTitle className="relative">
					<Input
						type="text"
						placeholder="Search users"
						value={search}
						onChange={handleSearch}
						className="pr-10 text-xl h-12"
					/>
					<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
						<SearchIcon className="w-8 h-8 text-muted-foreground" />
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{users.length > 0 &&
					users.map((user) => (
						<Link
							to={`/user/${user.username}`}
							className="flex flex-row justify-start items-center gap-4 hover:bg-secondary rounded-md p-3"
							key={user.username}
						>
							{user.profile_url ? (
								<img
									alt={`profile of ${user.username}`}
									src={user.profile_url}
									className="w-12 h-12 rounded-full object-cover flex justify-center align-middle"
								/>
							) : (
								<UserIcon className="w-12 h-12 rounded-full" />
							)}

							<span className="text-xl">{user.username}</span>
						</Link>
					))}
			</CardContent>
		</Card>
	);
}
