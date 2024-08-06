import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
	type S3Client,
	DeleteObjectCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3";
import type { imageDetails, User } from "../../types";

interface Env {
	DB: D1Database;
	PUB_URL: string;
}

export const onRequestPost: PagesFunction<
	Env,
	undefined,
	{ imageDetails: imageDetails; s3: S3Client; user_id: string }
> = async (ctx) => {
	const { imageDetails, s3, user_id } = ctx.data;

	const cmd = new PutObjectCommand({
		Bucket: "cloudflare-demo-app",
		Key: `${crypto.randomUUID()}_${imageDetails.name}`,
		ContentType: imageDetails.type,
		ContentLength: imageDetails.size,
	});

	const presignedUrl = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
	const imageUrl = `${ctx.env.PUB_URL}/${cmd.input.Key}`;

	try {
		// Before saving the image URL, we need to remove the previous image
		// if it exists in the bucket
		const user = await ctx.env.DB.prepare("SELECT * FROM users WHERE id = ?1")
			.bind(user_id)
			.first<User>();
		if (user.profile_url) {
			const url = user.profile_url;
			const key = url.split("/").at(-1);
			const delCmd = new DeleteObjectCommand({
				Bucket: "cloudflare-demo-app",
				Key: key,
			});
			await s3.send(delCmd);
		}

		// Save the image URl to the database
		await ctx.env.DB.prepare("UPDATE users SET profile_url = ?1 WHERE id = ?2")
			.bind(imageUrl, user_id)
			.run();
	} catch (e) {
		return Response.json(
			{ message: "An error occurred while saving the image" },
			{ status: 500 },
		);
	}

	return Response.json({ presignedUrl }, { status: 201 });
};
