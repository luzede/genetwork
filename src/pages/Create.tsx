// Hooks and other utilities
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToken } from "@/tokenContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Components
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Requests
import { newPost } from "@/requests/posts";

// Types
import type { Post } from "@/requests/posts";

// import { useToast } from "@/components/ui/use-toast";

export default function Create() {
	const [content, setContent] = useState<string>("");
	const { token, setToken } = useToken();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const postsMutation = useMutation({
		mutationFn: (content: string) =>
			newPost(content, localStorage.getItem("token")),
		onSuccess: (newPost) => {
			const posts = queryClient.getQueryData<Post[]>(["posts"]);
			if (posts === undefined) {
				queryClient.setQueryData(["posts"], [newPost]);
			} else {
				queryClient.setQueryData(["posts"], [newPost].concat(posts));
			}
			navigate("/");
		},
		onError: (e) => {
			if (e instanceof axios.AxiosError) {
				if (e.response?.status === 403) {
					localStorage.removeItem("token");
					setToken(null);
					queryClient.invalidateQueries({ queryKey: ["user"] });
				}
			} else if (e.message === "NO_TOKEN") {
				localStorage.removeItem("token");
				setToken(null);
				queryClient.invalidateQueries({ queryKey: ["user"] });
			}
		},
	});

	useEffect(() => {
		if (!token) {
			navigate("/login");
		}
	}, [token, navigate]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		postsMutation.mutate(content);
	};

	if (!token) return <></>;

	return (
		<div className="absolute top-0 min-h-full flex flex-col align-middle justify-center w-full overflow-y-scroll py-16">
			<Card className="w-full max-w-screen-md mx-auto border-0 md:border">
				<CardHeader>
					<CardTitle className="text-center text-3xl">
						Create a New Post
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form id="create-post" className="space-y-2" onSubmit={handleSubmit}>
						<Label htmlFor="post-content" className="text-2xl">
							Content
						</Label>
						<Textarea
							id="post-content"
							name="post-content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className="min-h-80 text-2xl"
							maxLength={400}
						/>
					</form>
				</CardContent>
				<CardFooter>
					<Button
						form="create-post"
						type="submit"
						className="w-full"
						disabled={postsMutation.isPending}
					>
						Post
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
