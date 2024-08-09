// Hooks and other utilities
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useToken } from "@/tokenContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

// Components
import {
	Card,
	CardContent,
	CardFooter,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, UserCircle } from "lucide-react";

// Requests
import type { User } from "@/requests/user";
import { getPosts } from "@/requests/posts";

// Types
import type { Post } from "@/requests/posts";

export default function UserProfile() {
	const navigate = useNavigate();
	const toaster = useToast();
	const { username } = useParams();
	const { setToken } = useToken();
	const queryClient = useQueryClient();

	useEffect(() => {
		console.log("User profile page mounted");
		const user = queryClient.getQueryData<User>(["user"]);

		if (user?.username === username) {
			navigate("/profile");
		}
	}, [queryClient, navigate, username]);

	const userQuery = useQuery({
		queryKey: ["user", username],
		queryFn: () =>
			axios.get<User>(`/api/users/${username}`).then((res) => res.data),
		retry: false,
	});

	const userPostsQuery = useQuery<Post[]>({
		queryKey: ["posts", username],
		queryFn: () => {
			// If the parsing fails, it will throw an error
			z.string()
				.min(3)
				.max(30)
				.regex(/^[a-zA-Z0-9]*$/)
				.parse(username);

			return getPosts(username, undefined, localStorage.getItem("token"));
		},
		retry: false,
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
			const posts = queryClient.getQueryData<Post[]>(["posts", username]);
			if (posts === undefined) {
				queryClient.invalidateQueries({ queryKey: ["posts", username] });
				queryClient.resetQueries({ queryKey: ["posts", username] });
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
				queryClient.setQueryData(["posts", username], updatedPosts);
			}
		},
		onError: (e) => {
			if (e instanceof axios.AxiosError) {
				if (e.response?.status === 403) {
					localStorage.removeItem("token");
					setToken(null);
					queryClient.invalidateQueries();
					queryClient.resetQueries();

					toaster.toast({
						variant: "destructive",
						title: "Unauthorized",
						description:
							"You are not logged in, you need to login to like a post",
					});
				}
			}

			console.log(e);
		},
	});

	const loadPostsMutation = useMutation({
		mutationFn: () => {
			const posts = queryClient.getQueryData<Post[]>(["posts", username]);
			if (posts === undefined) {
				queryClient.invalidateQueries({ queryKey: ["posts", username] });
				queryClient.resetQueries({ queryKey: ["posts", username] });
				throw new Error(
					"Unknown error occured in 'onSuccess' of postsMutation of Home.tsx where post is tried to be liked",
				);
			}
			const lastPost = posts.at(-1);
			return axios
				.get<Post[]>("/api/posts", {
					params: {
						before: lastPost
							? `${lastPost.created_at.replace(" ", "T")}Z`
							: undefined,
					},
					headers: {
						Authorization: localStorage.getItem("token")
							? `Bearer ${localStorage.getItem("token")}`
							: undefined,
					},
				})
				.then((res) => res.data);
		},
		onSuccess: (olderPosts) => {
			const posts = queryClient.getQueryData<Post[]>(["posts", username]);
			if (posts === undefined) {
				console.log(
					"Unknown error occured in 'onSuccess' of loadPostsMutation of User.tsx",
				);
			} else {
				queryClient.setQueryData(["posts", username], posts.concat(olderPosts));
			}
		},
		onError: (e) => {
			if (e instanceof axios.AxiosError) {
				if (e.response?.status === 422) {
					console.log("Faulty query parameters provided");
				}
				console.log(e);
			}
		},
	});

	if (userQuery.isLoading) return <div>Loading...</div>;

	if (userQuery.isError) return <></>;

	if (!userQuery.data) return <></>;

	return (
		<div className="flex flex-col align-middle gap-3 px-3">
			<Card className="flex flex-col justify-center align-middle max-w-lg w-full mx-auto p-6 gap-2">
				{userQuery.data.profile_url ? (
					<img
						src={userQuery.data.profile_url}
						alt="profile"
						className="object-cover h-32 w-32 rounded-full mx-auto flex justify-center align-middle"
					/>
				) : (
					<UserCircle className="h-32 w-32 rounded-full mx-auto" />
				)}
				<CardTitle className="mx-auto">{userQuery.data.username}</CardTitle>
				<CardDescription className="mx-auto">
					<span className="font-bold">Email: {userQuery.data.email}</span>
				</CardDescription>
			</Card>
			<CardTitle className="text-2xl font-bold mx-auto">Posts</CardTitle>
			{userPostsQuery.isLoading || !userPostsQuery.data ? (
				<div>Loading...</div>
			) : userPostsQuery.data.length > 0 ? (
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
						</CardFooter>
					</Card>
				))
			) : (
				<div className="mx-auto">No posts found.</div>
			)}
			<Button
				variant={"default"}
				onClick={() => loadPostsMutation.mutate()}
				className="mx-auto w-full max-w-lg"
				disabled={loadPostsMutation.isPending}
			>
				Load more posts
			</Button>
		</div>
	);
}
