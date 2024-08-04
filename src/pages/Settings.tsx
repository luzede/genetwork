// Hooks and other utilities
import { useRef, useState, useEffect } from "react";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { getCurrentUser, updateCurrentUser } from "@/requests/user";

// Schemas
import { settingsSchema } from "@/zodSchemas";

// ####################################################
// COMPONENT
// ####################################################
export default function Settings() {
	const [error, setError] = useState<{
		message: string;
		name?: string;
	} | null>(null);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const userQuery = useQuery({
		queryKey: ["user"],
		queryFn: getCurrentUser,
		retry: false,
	});
	const userMutation = useMutation({
		mutationFn: updateCurrentUser,
		onSuccess: () => {
			toaster.toast({
				variant: "default",
				title: "Success",
				duration: 5000,
				description: "Profile settings updated successfully",
			});
		},
		onError: (e) => {
			if (e instanceof axios.AxiosError) {
				if (e.response?.status === 403) {
					setError(e.response.data as { message: string });
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

			localStorage.removeItem("token");
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
	});

	useEffect(() => {
		console.log("Settings.tsx useEffect");
		if (userQuery.isError) {
			localStorage.removeItem("token");
			queryClient.invalidateQueries({ queryKey: ["user"] });
			navigate("/login");
		}
		if (userMutation.isError) {
			localStorage.removeItem("token");
			queryClient.invalidateQueries({ queryKey: ["user"] });
		}
	}, [userQuery, userMutation, queryClient, navigate]);

	const imageFormRef = useRef<HTMLFormElement>(null);

	const toaster = useToast();

	const handleImageSubmit = async (values: { image?: File | null }) => {
		if (!values.image) return;
		console.log(values.image.name);
		// 	// toast.success(`Image uploaded successfully 🎉 ${values.image.name}`);

		// 	// I guess here I get the signed URL from the server
		// 	// and begin the upload process
	};

	const handleSettingsSubmit = async (
		values: z.infer<typeof settingsSchema>,
	) => {
		try {
			imageFormRef.current?.requestSubmit();

			if (values.oldPassword === values.newPassword && values.newPassword) {
				console.log(values.oldPassword, values.newPassword);
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
		} catch (e) {
			console.log(e);
			if (e instanceof axios.AxiosError) {
				if (e.response?.status === 403) {
					setError(e.response.data as { message: string });
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

			throw e;
		}
	};

	const settingsForm = useForm<z.infer<typeof settingsSchema>>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			username: userQuery.data?.username || "", // This should be the user's username
			email: userQuery.data?.email || "", // This should be the user's email
			oldPassword: "",
			newPassword: "",
		},
	});

	settingsForm.setValue("username", userQuery.data?.username || "");
	settingsForm.setValue("email", userQuery.data?.email || "");

	if (userQuery.isLoading || userQuery.isError) return <></>;

	return (
		<div className="flex flex-col align-middle">
			<Card className="w-full max-w-screen-md mx-auto ">
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
													<Input
														{...field}
														id="email"
														// value={userQuery.data?.email}
														// defaultValue={userQuery.data?.email}
													/>
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
