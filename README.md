# GENetwork Cloudflare Demo App


## How to get it working
You need a Cloudflare account and their Wrangler CLI tool to make local development possible. After you have the above, you need to create `wrangler.toml` file like the example `wrangler.example.toml`. That is where all your environment variables are gonna be to use it in your functions. 

You can create a D1 database through CLI or through Cloudflare, but you will still need to use Cloudflare website to set things up, so you might as well do everything through Cloudflare.

R2 Storage is not really free, you need to sign up and use your card to activate the pay-as-you go plan.

### Local development
Creating a migration:
```bash
npx wrangler d1 migrations create app_name message
```
Applying migrations:
```bash
npx wrangler d1 migrations apply app_name --local
```
Start server (Before you do that, you need to build your project):
```
npm run build && npx wrangler pages dev
```

## What I learned

### Folder structure (Cloudflare Pages Structure)
```
project_name\
├── functions/ # You define CF Page Functions here
|   ├── api/
|   |   ├── login.ts # Matches "/api/login"
|   |   ├── register/
|   |   |   ├── index.ts # "/api/register"
|   |   ├── posts/
|   |   |   ├── [id].ts # "/api/posts/:id" ex. "/api/posts/69b420
|   |   |   ├── _middleware.ts # Runs before "[id].ts", good for auth
|   |   ├── misc/
|   |   |   ├── [[whatever]].ts # "/api/misc/**/*" ex. "/api/misc/what/ever"
|   |   |   ├── _middleware.ts # Runs before "[[whatever]].ts"
|   |   ├── _middleware.ts # Runs before all
├── migrations # If you are going to use D1
├── src # Your frontend
│   ├── ...
```

### Cloudflare Page Functions
Hono was a pain, I could not get it to work in Cloudflare Pages Function because it differs from Cloudflare Workers.

In CF Pages Function, it works like this
```typescript
// Gets executed only on GET requests
export const onRequestGet = async (ctx) => {...}
// Gets executed only on POST requests
export const onRequestPost = async (ctx) => {...}
// Gets executed only on DELETE requests
export const onRequestDelete = async (ctx) => {...}
// Gets executed only on PUT requests
export const onRequestPut = async (ctx) => {...}

// Gets executed on all requests
export const onRequest = async (ctx) => {...}
```
For middleware you define likes:
```typescript
const authentication = async (ctx) => {
	//...Authentication logic
	
	// If you want to pass data to the next middleware or function
	ctx.data.data_name = the_data
	// BEWARE! You cannot do "ctx.data = your_data"
	// Overwriting the data will throw an Error

	// After you are done you return
	return ctx.next()
}

const another_middleware = async(ctx) => {...}

// First, authentication will run and pass data to the next middleware
// and then another_middleware and lastly the function.
export const onRequestPost = [authentication, another_middleware, ...other]
// The middlewares will run before any POST request, while on other request
// types it will not run, so you can define middleware to run only on
// certain request types.
// To run only authentication on all request types
// you write "export const onRequest = [authentication]"
```
An example use case, where any person can access the posts data but they cannot create/modify/delete unless they are authorized.
```typescript
// functions/api/posts/_middleware.ts
const authentication = async(ctx) => {...}
export const onRequestPost = [authentication]
export const onRequestPut = [authentication]
export const onRequestDelete = [authentication]
```
```typescript
// functions/api/posts/index.ts
export const onRequestGet = async(ctx) => {...}
export const onRequestPost = async(ctx) => {...}
// ... and so on
```

### React Query
Invalidating a query with a key `["name"]` also invalidates queries with keys `["name", "something"]` which was not the behaviour I wanted, so I started naming my keys `["name something"]` and this worked:
```typescript
const queryClient = useQueryClient();
const userDetailsQuery = useQuery({
	queryKey: ["user", username],
	queryFn: () => ...,
})
// Invalidates all ["user", username] and ["user"]
queryClient.invalidateQueries(["user"])
```

By choosing the query to retry after an Error, the query will always be in a loading state:
```typescript
const query = useQuery({
	queryKey: ...,
	queryFn: ...,
	retry: true
})

query.isError // Always false
query.isLoading // Always true
```

Also, invalidating the query does not remove the data it holds, it only turns its state into stale, so if the query has cached an error or response, before it tries to re-fetch, it will act as the temporary value.

## Tools and resources I used
Image picker element in settings (I modified it to my use case):
https://github.com/shadcn-ui/ui/discussions/3188

Password hashing/verifying (bcrypt is not working on CF  because it is not Node runtime):
https://lord.technology/2024/02/21/hashing-passwords-on-cloudflare-workers.html


