// The good thing about this is that when the component is first loaded,
// the form fields are not validated until the user submits the form.
// After that, with every change in the form fields, the validation
// happens instantly on each keystroke.

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const loginSchema = z.object({
	username: z
		.string()
		.min(3, { message: "Username must be at least 3 characters." })
		.max(30, { message: "Username must be at most 30 characters." })
		.regex(/^[a-zA-Z0-9]*$/, {
			message: "Username must contain only letters and numbers",
		}),
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

export default function Login() {
	const loginForm = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	// This does not handle the "onSubmit" event of the form,
	// it just takes in the values of the form fields that are
	// The real onSubmit event handler is created with the
	// "loginForm.handleSubmit()" function." which takes in the
	// "SubmitEvent" argument and passes the form field values
	// to the "onSubmit" function that we defined below.
	function onSubmit(values: z.infer<typeof loginSchema>) {
		// Implement login logic here
		console.log(values);
		console.log(loginForm.handleSubmit.toString());
	}

	function onClick() {
		const form = document.getElementById("login-form") as HTMLFormElement;
		// form.addEventListener("submit", (e) => e.preventDefault());
		// There is already a submit event listener on the form that prevents
		// the default behavior, so we just call "requestSubmit()" to trigger
		// the onSubmit event. "submit()" does not trigger onSubmit event nor
		// validates the input before submitting the form field contents
		// and it also cannot be stopped by preventDefault, it just refreshes
		// without emitting the onSubmit event.
		// All this is handle by the "loginForm.handleSubmit" function to which
		// we pass our onSubmit event handler.
		form.requestSubmit();
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Login</CardTitle>
				<CardDescription>
					Enter your email and password to access your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...loginForm}>
					<form
						id="login-form"
						onSubmit={loginForm.handleSubmit(onSubmit)}
						className="space-y-8"
					>
						<FormField
							control={loginForm.control}
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
										<Input {...field} id="username" autoComplete="username" />
									</FormControl>
									<FormMessage className="" />
								</FormItem>
							)}
						/>
						<FormField
							control={loginForm.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor="password">Password</FormLabel>
									<FormControl>
										<Input
											{...field}
											id="password"
											type="password"
											autoComplete="current-password"
										/>
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
					Login
				</Button>
			</CardFooter>
		</Card>
	);
}
