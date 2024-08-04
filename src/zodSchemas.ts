import { z } from "zod";

// settingsSchema
export const settingsSchema = z.object({
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
	oldPassword: z
		.string()
		.min(8, { message: "Password length must be at least 8 characters long." })
		.max(50, {
			message: "Password length must be at most 50 characters long.",
		})
		.regex(/^[a-zA-Z0-9!@#$%^&*]*$/, {
			message:
				"Password must contain only letters, numbers, and following special characters: !@#$%^&*",
		})
		.nullish()
		.or(z.literal(""))
		.transform((value) => (!value ? undefined : value)),
	newPassword: z
		.string()
		.min(8, { message: "Password length must be at least 8 characters long." })
		.max(50, {
			message: "Password length must be at most 50 characters long.",
		})
		.regex(/^[a-zA-Z0-9!@#$%^&*]*$/, {
			message:
				"Password must contain only letters, numbers, and following special characters: !@#$%^&*",
		})
		.nullish()
		.or(z.literal(""))
		.transform((value) => (!value ? undefined : value)),
});

// imageFormSchema
export const imageFormSchema = z.object({
	image: z
		//Rest of validations done via react dropzone
		.instanceof(File)
		.nullish(),
});
