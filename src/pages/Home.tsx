// Hooks and other utilities
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToken } from "@/tokenContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

// Components
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Types
import type { Post } from "@/requests/posts";
import { Heart, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
	const toaster = useToast();
	const { setToken } = useToken();
	const queryClient = useQueryClient();
	const postsQuery = useQuery<Post[]>({
		queryKey: ["posts"],
		queryFn: () =>
			axios
				.get("/api/posts", {
					headers: {
						Authorization: localStorage.getItem("token")
							? `Bearer ${localStorage.getItem("token")}`
							: undefined,
					},
				})
				.then((res) => res.data),
		staleTime: 1000 * 60 * 5,
		retry: false,
		refetchOnMount: false,
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
				queryClient.invalidateQueries({ queryKey: ["posts"] });
				queryClient.resetQueries({ queryKey: ["posts"] });
				console.log(
					"Unknown error occured in 'onSuccess' of postsMutation of Home.tsx where post is tried to be liked",
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
				queryClient.setQueryData(["posts"], updatedPosts);
			}
		},
		onError: (e) => {
			if (e instanceof axios.AxiosError) {
				if (e.response?.status === 403) {
					localStorage.removeItem("token");
					setToken(null);
					queryClient.invalidateQueries({ queryKey: ["user"] });
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
			const posts = queryClient.getQueryData<Post[]>(["posts"]);
			if (posts === undefined) {
				queryClient.invalidateQueries({ queryKey: ["posts"] });
				queryClient.resetQueries({ queryKey: ["posts"] });
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
			const posts = queryClient.getQueryData<Post[]>(["posts"]);
			if (posts === undefined) {
				console.log(
					"Unknown error occured in 'onSuccess' of loadPostsMutation of Home.tsx",
				);
			} else {
				queryClient.setQueryData(["posts"], posts.concat(olderPosts));
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

	if (postsQuery.isLoading) return <div>Loading...</div>;

	if (postsQuery.isError) return <div>Error: {postsQuery.error.message}</div>;

	if (!postsQuery.data) return <></>;

	return (
		<div className="flex flex-col align-middle w-full gap-4 px-3">
			{postsQuery.data.map((post) => (
				<Card key={post.id} className="max-w-lg w-full mx-auto">
					<CardHeader className="flex align-middle p-0">
						<Link
							to={`/user/${post.username}`}
							className="flex flex-row justify-start align-middle gap-3 p-6"
						>
							{post.profile_url ? (
								<img
									src={post.profile_url}
									alt="profile"
									className="object-cover h-10 w-10 rounded-full"
								/>
							) : (
								<UserCircle className="h-10 w-10 rounded-full" />
							)}
							<CardTitle className="flex justify-center align-middle translate-y-1">
								{post.username}
							</CardTitle>
						</Link>
					</CardHeader>
					<CardContent className="text-xl">{post.content}</CardContent>
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
								// It does not matter what value I give to fill,
								// it will always feel as long as attribute is active
								// even if the value of the attribute is undefined
								// so I had to make two icons, one with fill and one without
								<Heart className="h-7 w-7 fill-current" fill="currentFill" />
							) : (
								<Heart className="h-7 w-7" />
							)}
							<span className="text-2xl font-normal">{post.likes}</span>
						</Button>
					</CardFooter>
				</Card>
			))}
			<Button
				onClick={() => loadPostsMutation.mutate()}
				disabled={loadPostsMutation.isPending}
				className="max-w-lg w-full mx-auto"
			>
				Load More
			</Button>
		</div>
	);
}
