# Supabase Cookie Auth Proxy

Utilizing Cloudflare workers to use cookie based session auth, instead of refreshing JWTs.

### :warning: This is a work in progress

## How It Works

#### Cloudflare Worker

Supabase Cookie Auth Proxy is a Cloudflare worker that proxies all requests between supabase and your frontend.

It intercepts key requests, such as on the sign in endpoint, and handles updating a session cookie.

This session cookie id references a session stored on the edge in Workers KV. The session contains the user information and a custom JWT, which is added to each request to Supabase.

A couple of extra endpoints are also added to control this new session functionality. GET `/edge/v1/session` for reading the current session with low latency, and DELETE `/edge/v1/sessions/*session-id*` for invalidating sessions.

Websockets are also proxied with the correct JWT added, supporting Supabase realtime.

#### Next.js Edge Auth

The example provided is of Next.js and uses its `_middleware.ts` files in order to authorize users.

To allow for SSG, but without having a flash on the first load of the user being logged out, every page is mirrored in the `_authenticated` directory. Then, the middleware checks on every request if the user is logged in or not. If they are, the request gets rewritten to the corresponding page, which has the authenticated layout. If they are not logged in, the second middleware (in the non \_authenticated page directory) will be hit, as the initial middleware did not rewrite the request. Upon being hit, the second middleware will redirect the user to the sign in screen.

SSR may also be used to avoid all loading flashes. See `getServerSideProps` in [\_authenticated/ssr.tsx](example/pages/_authenticated/ssr.tsx)

## Installation

Clone the git repo

```bash
git clone https://github.com/alaister/supabase-cookie-auth-proxy.git
```

Update `account_id` and `[vars]` in `wrangler.toml`

Run

```bash
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put JWT_SECRET
wrangler kv:namespace create SESSIONS_KV
```

and then update the `kv_namespaces` binding id in `wrangler.toml`

Run

```bash
wrangler publish
```

Setup the worker to run on `/supabase/*` on your domain

Run the sql found in [schema.sql](schema.sql) in Supabase

Change the supabase url found in your frontend project to `https://yourdomain.com/supabase`

## Todo

- Use supabase hooks to call the edge function whenever the user is updated
- Make oauth work. Gotrue (server) doesn't like when you mess with the redirect_uri. Maybe this will be easier once this is implemented: https://github.com/supabase/gotrue/issues/233
- Work out how to use realtime in development. Currently Next.js rewrites don't seem to support websockets
- Example for retrieving the user in Next.js api endpoints
