# Supabase Cookie Auth Proxy

Utilizing Cloudflare workers to use cookie based session auth, instead of refreshing JWTs.

### :warning: This is a work in progress

## Todo

- Use supabase hooks to call the edge function whenever the user is updated
- Make oauth work. Gotrue (server) doesn't like when you mess with the redirect_uri. Maybe this will be easier once this is implemented: https://github.com/supabase/gotrue/issues/233
- Work out how to use realtime in development. Currently next.js rewrites don't seem to support redirects
