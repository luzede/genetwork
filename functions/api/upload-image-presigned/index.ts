import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { imageDetails } from "../../types";

interface Env {
	DB: D1Database;
}

export const onRequestPost: PagesFunction<
	Env,
	undefined,
	{ imageDetails: imageDetails; s3: S3Client }
> = async (ctx) => {
	const { imageDetails, s3 } = ctx.data;

	const cmd = new PutObjectCommand({
		Bucket: "cloudflare-demo-app",
		Key: `${imageDetails.name}_${crypto.randomUUID()}`,
		ContentType: imageDetails.type,
		ContentLength: imageDetails.size,
	});

	const presignedUrl = await getSignedUrl(s3, cmd, { expiresIn: 3600 });

	return Response.json({ presignedUrl }, { status: 201 });
};
