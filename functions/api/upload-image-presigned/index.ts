interface Env {
	DB: D1Database;
	JWT_SECRET: string;
	BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<
	Env,
	undefined,
	{ username: string }
> = async (ctx) => {
	return Response.json("Hello, world!");
};
