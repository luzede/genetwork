// The good thing about this is that when the component is first loaded,
// the form fields are not validated until the user submits the form.
// After that, with every change in the form fields, the validation
// happens instantly on each keystroke.

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { AlertErrorMessage } from "@/components";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const registerSchema = z.object({
	username: z
		.string()
		.min(3, { message: "Username must be at least 3 characters." })
		.max(30, { message: "Username must be at most 30 characters." })
		.regex(/^[a-zA-Z0-9]*$/, {
			message: "Username must contain only letters and numbers",
		}),
	email: z
		.string()
		.email()
		.max(255, { message: "Email must be at most 255 characters." }),
	password: z
		.string()
		.min(8, { message: "Password length must be at least 8 characters long." })
		.max(50, {
			message: "Password length must be at most 50 characters long.",
		})
		.regex(/^[a-zA-Z0-9!@#$%^&*]*$/, {
			message:
				"Password must contain only letters, numbers, and following special characters: !@#$%^&*",
		}),
});

export default function Register() {
	const navigate = useNavigate();
	const [registrationError, setRegistrationError] = useState<{
		message: string;
		name?: string;
	} | null>(null);

	const [tokenExists] = useState(localStorage.getItem("token") !== null);

	useEffect(() => {
		if (tokenExists) {
			navigate("/");
		}
	}, [tokenExists, navigate]);

	const registerForm = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof registerSchema>) {
		try {
			const resp = await axios.post("/api/register", values, {
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (resp.status === 201) {
				navigate("/login", { state: { accountCreated: true } });
			}
		} catch (err) {
			if (err instanceof AxiosError) {
				if (err.response?.status === 409) {
					setRegistrationError(err.response.data as { message: string });
				} else {
					setRegistrationError({
						message: "An error occurred while registering the account.",
					});
				}
			}
			throw err;
		}
	}

	function onClick() {
		const form = document.getElementById("register-form") as HTMLFormElement;
		form.requestSubmit();
	}

	return tokenExists ? (
		<></>
	) : (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="text-center">Registration</CardTitle>
				<CardDescription className="text-center">
					Enter a username, email and password to create an account
				</CardDescription>
			</CardHeader>
			<CardContent>
				{registrationError && (
					<AlertErrorMessage
						description={registrationError.message}
						title={registrationError.name || "Error"}
					/>
				)}
				<Form {...registerForm}>
					<form
						id="register-form"
						onSubmit={registerForm.handleSubmit(onSubmit)}
						className="space-y-8"
					>
						<FormField
							control={registerForm.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									{/* 
                                It automatically assigns htmlFor on the label and id on the input
                                along with name and other attributes, however the id does not equal
                                to the name of the label, to give it a custom name, you have to
                                explicitly give it id and htmlFor and other attributes 
                            */}
									<FormLabel htmlFor="username">Username</FormLabel>
									<FormControl>
										<Input {...field} id="username" />
									</FormControl>
									<FormMessage className="" />
								</FormItem>
							)}
						/>
						<FormField
							control={registerForm.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor="email">Email</FormLabel>
									<FormControl>
										<Input {...field} id="email" type="email" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={registerForm.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor="password">Password</FormLabel>
									<FormControl>
										<Input {...field} id="password" type="password" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
			</CardContent>
			<CardFooter>
				<Button onClick={onClick} className="w-full">
					Register
				</Button>
			</CardFooter>
		</Card>
	);
}
