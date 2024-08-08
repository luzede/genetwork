// Hooks and other utilities
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useToken } from "@/tokenContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Components
import {
	Card,
	CardContent,
	CardFooter,
	// CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash, UserCircle } from "lucide-react";
// import { Link } from "react-router-dom";

// Requests
import { getUser, type User } from "@/requests/user";
import { getPosts } from "@/requests/posts";

// Types
import type { Post } from "@/requests/posts";

export default function Profile() {
	const navigate = useNavigate();
	const { token, setToken } = useToken();
	const queryClient = useQueryClient();
	const userQuery = useQuery({
		queryKey: ["user"],
		queryFn: () => getUser(localStorage.getItem("token")),
		retry: false,
	});
	const userPostsQuery = useQuery<Post[]>({
		queryKey: ["profile-posts"],
		queryFn: () => {
			const user = queryClient.getQueryData<User>(["user"]);
			if (!user) throw new Error("User not found");
			return getPosts(user.username, undefined, localStorage.getItem("token"));
		},
		staleTime: 0,
		retry: true,
	});

	const deletePostMutation = useMutation({
		mutationFn: async (postId: number) => {
			await axios.delete(`/api/posts/${postId}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			return postId;
		},
		onSuccess: (postId) => {
			const userPosts = queryClient.getQueryData<Post[]>(["profile-posts"]);
			// After changing the tab to home, the posts will be updated
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			if (userPosts === undefined) {
				queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
				queryClient.resetQueries({ queryKey: ["profile-posts"] });
				console.log(
					"Unknown error occured in 'onSuccess' of postsMutation of Profile.tsx where post is tried to be deleted",
				);
			} else {
				const updatedPosts = userPosts.filter((post) => post.id !== postId);
				queryClient.setQueryData(["profile-posts"], updatedPosts);
			}
		},
		onError: (e) => {
			if (e instanceof axios.AxiosError) {
				if (e.response?.status === 403) {
					localStorage.removeItem("token");
					setToken(null);
					queryClient.invalidateQueries();
					queryClient.resetQueries();
				}
			}
			console.log(e);
		},
	});

	const postLikeMutation = useMutation({
		mutationFn: async ({
			postId,
			type,
		}: { postId: number; type: "LIKE" | "DISLIKE" }) => {
			// Put request can only be like since no more modification can be done
			// other than the liking of the post. So, we can just send put requests
			const resp = await axios.put<{ message: "LIKED" | "DISLIKED" }>(
				`/api/posts/${postId}`,
				{ type },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);

			return { postId, message: resp.data.message };
		},
		onSuccess: ({ postId, message }) => {
			const posts = queryClient.getQueryData<Post[]>(["profile-posts"]);
			if (posts === undefined) {
				queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
				queryClient.resetQueries({ queryKey: ["profile-posts"] });
				console.log(
					"Unknown error occured in 'onSuccess' of postsMutation of Profile.tsx where post is tried to be liked",
				);
			} else {
				const updatedPosts = posts.map((post) => {
					return {
						...post,
						likes:
							post.id !== postId
								? post.likes
								: message === "LIKED"
									? post.likes + 1
									: post.likes - 1,
						liked:
							post.id !== postId ? post.liked : message === "LIKED" ? 1 : null,
					};
				});
				queryClient.setQueryData(["profile-posts"], updatedPosts);
			}
		},
		onError: (e) => {
			if (e instanceof axios.AxiosError) {
				if (e.response?.status === 403) {
					localStorage.removeItem("token");
					setToken(null);
					queryClient.invalidateQueries();
					queryClient.resetQueries();
				}
			}
			console.log(e);
		},
	});

	useEffect(() => {
		if (userQuery.isError || !token) {
			localStorage.removeItem("token");
			setToken(null);
			queryClient.invalidateQueries();
			queryClient.resetQueries();
			navigate("/login");
		}
	}, [userQuery, queryClient, setToken, navigate, token]);

	if (userQuery.isLoading) return <div>Loading...</div>;

	if (userQuery.isError || !token) return <></>;

	if (!userPostsQuery.data || !userQuery.data) return <></>;

	return (
		<div className="flex flex-col align-middle gap-3 px-3">
			<Card className="flex flex-col justify-center align-middle max-w-lg w-full mx-auto p-6 gap-2">
				{userQuery.data.profile_url ? (
					<img
						src={userQuery.data.profile_url}
						alt="profile"
						className="object-cover h-32 w-32 rounded-full mx-auto"
					/>
				) : (
					<UserCircle className="h-32 w-32 rounded-full mx-auto" />
				)}
				<CardTitle className="mx-auto">{userQuery.data.username}</CardTitle>
				<CardDescription className="mx-auto">
					<span className="font-bold">Email: {userQuery.data.email}</span>
				</CardDescription>
			</Card>
			{userPostsQuery.isLoading ? (
				<div>Loading...</div>
			) : (
				userPostsQuery.data.map((post) => (
					<Card key={post.id} className="max-w-lg w-full mx-auto">
						<CardContent className="text-xl pt-6 pb-3">
							{post.content}
						</CardContent>
						<CardFooter className="flex justify-between align-middle p-0">
							<Button
								variant="ghost"
								size="icon"
								onClick={() =>
									postLikeMutation.mutate({
										postId: post.id,
										type: post.liked === 1 ? "DISLIKE" : "LIKE",
									})
								}
								disabled={postLikeMutation.isPending}
								className="flex-auto flex justify-evenly align-middle m-2 py-2"
							>
								{post.liked === 1 ? (
									// (Seems like fill attribute does not work and had to use tw fill-current)
									<Heart className="h-7 w-7 fill-current" fill="currentFill" />
								) : (
									<Heart className="h-7 w-7" />
								)}
								<span className="text-2xl font-normal">{post.likes}</span>
							</Button>
							<Button
								variant={"ghost"}
								className="flex-auto flex justify-evenly align-middle m-2 py-2"
								onClick={() => deletePostMutation.mutate(post.id)}
								disabled={deletePostMutation.isPending}
							>
								<Trash className="h-7 w-7" />
							</Button>
						</CardFooter>
					</Card>
				))
			)}
		</div>
	);
}
