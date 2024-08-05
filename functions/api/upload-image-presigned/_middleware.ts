import * as jose from "jose";
import { imageDetailsSchema } from "../../schemas";
import { z } from "zod";
import { S3Client } from "@aws-sdk/client-s3";

interface Env {
	DB: D1Database;
	JWT_SECRET: string;
	ACCESS_KEY_ID: string;
	SECRET_ACCESS_KEY: string;
	ACCOUNT_ID: string;
}

const authentication: PagesFunction<Env> = async (ctx) => {
	const auth_header = ctx.request.headers.get("Authorization");
	if (!auth_header || !auth_header.startsWith("Bearer ")) {
		return Response.json({ message: "Unauthorized" }, { status: 403 });
	}
	const token = auth_header.replace("Bearer ", "");
	try {
		const encoder = new TextEncoder();

		const { payload } = await jose.jwtVerify(
			token,
			encoder.encode(ctx.env.JWT_SECRET),
		);
		// Pass in the username to the context data
		ctx.data.username = payload.sub;
		return ctx.next();
	} catch (e) {
		return Response.json({ message: "Unauthorized" }, { status: 403 });
	}
};

// const validate: PagesFunction<Env> = async (ctx) => {

// }

// Used to validate the request body which has details
// about the image size and type to be uploaded
const validation: PagesFunction<Env> = async (ctx) => {
	try {
		const body = await ctx.request.json();
		const data = imageDetailsSchema.parse(body);

		ctx.data.imageDetails = data;
		return ctx.next();
	} catch (e) {
		if (e instanceof z.ZodError) {
			return Response.json({ message: e.errors }, { status: 422 });
		}
		if (e instanceof SyntaxError) {
			return Response.json({ message: e.message }, { status: 422 });
		}
		return Response.json(
			{ message: "An error occured during image upload validation" },
			{ status: 500 },
		);
	}
};

const s3client: PagesFunction<Env> = async (ctx) => {
	const s3 = new S3Client({
		region: "auto",
		endpoint: `https://${ctx.env.ACCOUNT_ID}r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: ctx.env.ACCESS_KEY_ID,
			secretAccessKey: ctx.env.SECRET_ACCESS_KEY,
		},
	});
	ctx.data.s3 = s3;
	return ctx.next();
};

export const onRequestPost = [authentication, validation, s3client];
