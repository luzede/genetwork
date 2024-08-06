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
		Key: user_id,
		ContentType: imageDetails.type,
		ContentLength: imageDetails.size,
	});

	// Even if there is an object in the presigned URL, it will be overwritten
	const presignedUrl = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
	const imageUrl = `${ctx.env.PUB_URL}/${cmd.input.Key}`;

	try {
		// Save the image URL to the database
		await ctx.env.DB.prepare(
			"UPDATE users SET profile_url = ?1 WHERE id = ?2 AND profile_url IS NULL",
		)
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
