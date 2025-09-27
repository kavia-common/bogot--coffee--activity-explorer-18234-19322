# Supabase Integration

This frontend integrates Supabase for authentication and (future) data storage.

Environment variables (set in `.env`):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Auth:
- The app uses passwordless email (magic link) with `supabase.auth.signInWithOtp`.
- The redirect URL is set to `window.location.origin`. Ensure this origin is whitelisted in the Supabase Auth settings.

Data (suggested tables):
- cafes (id, name, neighborhood, lat, lng, rating, tags[], price, image_url, created_at)
- plans (id, cafe_id, title, start_at, price, tags[], created_at)
- profiles (id uuid references auth.users, role enum('user','cafe_owner','superadmin'))

Role Handling:
- The MVP infers role from email substring for demo purposes.
- For production, store role in `profiles.role` and use RLS policies to restrict access.

Queries:
- Replace mock data in ExplorePage with Supabase queries filtering by q, neighborhood, price, tags.

Security:
- Use Row Level Security and policies per role.
- Only expose public data in anon key; write operations should be properly guarded.

