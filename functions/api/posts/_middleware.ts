import * as jose from "jose";

interface Env {
	DB: D1Database;
	JWT_SECRET: string;
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
		ctx.data.user_id = payload.sub;
		return ctx.next();
	} catch (e) {
		return Response.json({ message: "Unauthorized" }, { status: 403 });
	}
};

const is_authenticated: PagesFunction<Env> = async (ctx) => {
	const auth_header = ctx.request.headers.get("Authorization");
	if (!auth_header || !auth_header.startsWith("Bearer ")) {
		return ctx.next();
	}
	const token = auth_header.replace("Bearer ", "");
	try {
		const encoder = new TextEncoder();

		const { payload } = await jose.jwtVerify(
			token,
			encoder.encode(ctx.env.JWT_SECRET),
		);
		ctx.data.user_id = payload.sub;
		return ctx.next();
	} catch (e) {
		return ctx.next();
	}
};

export const onRequestPost = [authentication];
export const onRequestDelete = [authentication];
export const onRequestPut = [authentication];
export const onRequestGet = [is_authenticated];
