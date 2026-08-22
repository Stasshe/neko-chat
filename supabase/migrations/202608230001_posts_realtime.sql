grant select on public.posts to authenticated;

alter publication supabase_realtime add table public.posts;
