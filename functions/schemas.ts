import { z } from "zod";

// settingsSchema
export const settingsSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(30)
		.regex(/^[a-zA-Z0-9]*$/),
	email: z.string().email().max(255),
	oldPassword: z
		.string()
		.min(8)
		.max(50)
		.regex(/^[a-zA-Z0-9!@#$%^&*]*$/)
		.nullish()
		.or(z.literal(""))
		.transform((value) => (!value ? undefined : value)),
	newPassword: z
		.string()
		.min(8)
		.max(50)
		.regex(/^[a-zA-Z0-9!@#$%^&*]*$/)
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

export const loginSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(30)
		.regex(/^[a-zA-Z0-9]*$/),
	password: z
		.string()
		.min(8)
		.max(50)
		.regex(/^[a-zA-Z0-9!@#$%^&*]*$/),
});

export const imageDetailsSchema = z.object({
	name: z.string().min(1),
	size: z
		.number()
		.gte(67) // 67 bytes is the smallest possible size for png, I don't know about other formats
		.lte(1024 * 1024),
	type: z.string().regex(/image\/(jpeg|png|jpg)/),
});
