// Hooks and other utilities
import { useRef, useState, useEffect } from "react";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToken } from "@/tokenContext";

// Components
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AlertErrorMessage } from "@/components";
import { ImageUploader } from "@/components";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Requests
import { getUser, updateUser } from "@/requests/user";

// Schemas
import { settingsSchema } from "@/zodSchemas";

// Types
import type { UserUpdate } from "@/requests/user";

// Protected
const protected_pathnames = ["/settings", "/profile", "/create"];

// ####################################################
// COMPONENT
// ####################################################
export default function Settings() {
	const location = useLocation();
	const [error, setError] = useState<{
		message: string;
		name?: string;
	} | null>(null);
	const { token, setToken } = useToken();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const userQuery = useQuery({
		queryKey: ["user"],
		queryFn: () => getUser(localStorage.getItem("token")),
		retry: false,
	});

	useEffect(() => {
		if (userQuery.isError || token === null) {
			localStorage.removeItem("token");
			setToken(null);
			queryClient.invalidateQueries();
			queryClient.resetQueries();
			if (protected_pathnames.includes(location.pathname)) navigate("/login");
		}
	}, [navigate, userQuery, setToken, queryClient, token, location]);

	const userMutation = useMutation({
		mutationFn: (values: UserUpdate) =>
			updateUser(values, localStorage.getItem("token")),
		onSuccess: () => {
			toaster.toast({
				variant: "default",
				title: "Success",
				duration: 5000,
				description: "Profile settings updated successfully",
			});

			queryClient.invalidateQueries({ queryKey: ["user"] });
			queryClient.resetQueries({ queryKey: ["user"] });
		},
		onError: (e) => {
			if (e instanceof axios.AxiosError) {
				if (e.response?.status === 403) {
					setError(e.response.data as { message: string });
					localStorage.removeItem("token");
					setToken(null);
					navigate("/login");
				} else {
					setError(
						e.response?.data || {
							message: "An error occurred while updating settings",
						},
					);
				}
			}
			if (e instanceof Error) {
				setError({ message: e.message });
			}

			queryClient.invalidateQueries({ queryKey: ["user"] });
			queryClient.resetQueries({ queryKey: ["user"] });
		},
	});

	const imageFormRef = useRef<HTMLFormElement>(null);

	const toaster = useToast();

	const handleImageSubmit = async (values: { image?: File | null }) => {
		if (!values.image || values.image.size === 0) return;

		const body = {
			name: values.image.name,
			size: values.image.size,
			type: values.image.type,
		};

		try {
			// Getting the presigned URL
			const resp = await axios.post<{ presignedUrl: string }>(
				"/api/upload-image-presigned",
				body,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				},
			);

			// Uploading the image to the bucket
			await axios.put(resp.data.presignedUrl, values.image, {
				headers: {
					"Content-Type": values.image.type,
				},
			});

			toaster.toast({
				title: "Success",
				description: "Image uploaded successfully",
			});
		} catch (e) {
			if (e instanceof axios.AxiosError) {
				if (e.response?.status === 403) {
					setError(e.response.data as { message: string });
					localStorage.removeItem("token");
					setToken(null);
					navigate("/login");
				} else {
					setError(
						e.response?.data || {
							message: "An error occurred while updating settings",
						},
					);
				}
			} else if (e instanceof Error) {
				setError({ message: e.message });
			} else {
				throw e;
			}
		}
	};

	const handleSettingsSubmit = async (
		values: z.infer<typeof settingsSchema>,
	) => {
		// console.log does not work inside this function
		// for some reason

		imageFormRef.current?.requestSubmit();

		if (values.oldPassword === values.newPassword && values.newPassword) {
			throw new Error("Old and new password cannot be the same");
		}

		// If nothing has changed, don't make a request
		if (
			userQuery.data?.email === values.email &&
			userQuery.data?.username === values.username &&
			!values.newPassword
		)
			return;

		userMutation.mutate(values);
	};

	const settingsForm = useForm<z.infer<typeof settingsSchema>>({
		mode: "onChange",
		resolver: zodResolver(settingsSchema),
		// Not tested but "values" works better than "defaultValues"
		// since I have not encountered issues with this unlike "defaultValues" before
		values: {
			username: userQuery.data?.username || "", // This should be the user's username
			email: userQuery.data?.email || "", // This should be the user's email
			oldPassword: "",
			newPassword: "",
		},
	});

	if (userQuery.isLoading || userQuery.isError || token === null) return <></>;

	return (
		<div className="flex flex-col align-middle">
			<Card className="w-full max-w-screen-md mx-auto border-0">
				<CardHeader>
					<CardTitle className="text-center text-3xl">Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl text-center">
								Profile Picture
							</CardTitle>
							<CardDescription className="text-center">
								Click to change your profile picture
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ImageUploader
								className="mx-auto w-1/6 min-w-28"
								onSubmit={handleImageSubmit}
								ref={imageFormRef}
							/>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="mt-8">
							{error && (
								<AlertErrorMessage
									description={error.message}
									title={error.name || "Error"}
								/>
							)}
							<Form {...settingsForm}>
								<form
									id="settings-form"
									className="flex flex-col align-middle justify-between gap-3"
									onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)}
								>
									<FormField
										control={settingsForm.control}
										name="username"
										render={({ field }) => (
											<FormItem className="text-center">
												<FormLabel htmlFor="username" className="text-xl">
													Username
												</FormLabel>
												<FormControl className="text-center">
													<Input
														{...field}
														id="username"
														// value={userQuery.data?.username}
														// defaultValue={userQuery.data?.username}
													/>
												</FormControl>
												<FormMessage className="" />
											</FormItem>
										)}
									/>
									<FormField
										control={settingsForm.control}
										name="email"
										render={({ field }) => (
											<FormItem className="text-center">
												<FormLabel htmlFor="email" className="text-xl">
													Email
												</FormLabel>
												<FormControl className="text-center">
													<Input {...field} id="email" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={settingsForm.control}
										name="oldPassword"
										render={({ field }) => (
											<FormItem className="text-center">
												<FormLabel htmlFor="oldPassword" className="text-xl">
													Old Password
												</FormLabel>
												<FormControl className="text-center">
													<Input {...field} id="oldPassword" type="password" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={settingsForm.control}
										name="newPassword"
										render={({ field }) => (
											<FormItem className="text-center">
												<FormLabel htmlFor="newPassword" className="text-xl">
													New Password
												</FormLabel>
												<FormControl className="text-center">
													<Input {...field} id="newPassword" type="password" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										type="submit"
										variant="default"
										className="text-center mt-8"
									>
										Update
									</Button>
								</form>
							</Form>
						</CardContent>
					</Card>
				</CardContent>
			</Card>
		</div>
	);
}
