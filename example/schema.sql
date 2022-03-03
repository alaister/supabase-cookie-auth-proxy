create table "sessions"(
  "id" uuid not null primary key default uuid_generate_v4(),
  "created_at" timestamptz not null default now(),
  "expires_at" timestamptz not null default now() + interval '1 year',
  "user_id" uuid not null references auth.users("id") on delete cascade on update cascade,
  "ip" text,
  "country" text,
  "user_agent" text
);

create index on "sessions"("user_id");

alter table "sessions" enable row level security;

create policy "can view own sessions" on "sessions"
for select using (
  user_id = auth.uid()
);