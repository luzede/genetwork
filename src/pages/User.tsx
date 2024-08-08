// Hooks and other utilities
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useToken } from "@/tokenContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";

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
	const toaster = useToast();
	const { username } = useParams();
	const { token, setToken } = useToken();
	const queryClient = useQueryClient();

	const userQuery = useQuery({
		queryKey: ["user", username],
		queryFn: () =>
			axios.get<User>(`/api/users/${username}`).then((res) => res.data),
		retry: true,
		retryDelay: 1000,
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
		retry: true,
		retryDelay: 1000,
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
			const posts = queryClient.getQueryData<Post[]>(["posts"]);
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
						</CardFooter>
					</Card>
				))
			)}
		</div>
	);
}
