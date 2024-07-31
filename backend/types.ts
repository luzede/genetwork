import type { D1Database } from "@cloudflare/workers-types";

export type Bindings = {
	MY_NAME: string;
	DB: D1Database;
};
