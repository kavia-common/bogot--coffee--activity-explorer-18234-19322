# Supabase Integration (Backend + Frontend)

This frontend integrates Supabase for authentication and data. Follow these steps to configure your Supabase project and connect the app.

Environment variables (set in `.env` at frontend_web_app root):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- Optional: REACT_APP_SITE_URL (if not set, window.location.origin is used)

Auth:
- The app uses passwordless email (magic link) with `supabase.auth.signInWithOtp`.
- Redirects are set dynamically via `${getURL()}auth/callback`.

Supabase Dashboard configuration:
1) Authentication > URL Configuration
   - Site URL: your production URL (e.g., https://yourapp.com/)
   - Redirect URLs (add both dev and prod):
     * http://localhost:3000/**
     * https://yourapp.com/**
2) Authentication > Providers
   - Enable Email (OTP / Magic Link).
3) (Optional) Email Templates
   - Update content if desired.

Database schema and policies:
- Run the SQL in assets/supabase_schema.sql in your Supabase SQL editor to create:
  - Enum user_role: 'user','cafe_owner','superadmin'
  - Tables: profiles (1:1 auth.users), cafes, plans
  - RLS policies:
    * Public read of cafes and plans
    * Owners (cafe_owner) can write to their cafes and associated plans
    * superadmin can manage everything
  - Trigger to auto-create a profiles row on user sign-up

Role Handling:
- profiles.role drives authorization:
  - user: read-only access to public data
  - cafe_owner: can manage their cafes/plans
  - superadmin: full admin
- To promote a user:
  ```
  update public.profiles set role = 'cafe_owner' where id = '<auth_user_uuid>';
  -- or 'superadmin'
  ```

Frontend usage:
- Supabase client and auth helpers are in src/utils/supabase.js
- Auth callback route is at /auth/callback (src/routes/AuthCallback.js)
- Never hardcode URLs; getURL() builds based on env or window origin.

Queries (after schema is in place):
- Replace mock data in ExplorePage with filtered queries like:
  ```
  const query = supabase
    .from('cafes')
    .select('*')
    .ilike('name', `%${q}%`)
    .eq('neighborhood', nei)
    .eq('price', price)
    .contains('tags', tagsArray)
  ```

Security:
- RLS is enabled for all tables; anon key only reads public data.
- Writes require authenticated users with appropriate roles per policy.

Tooling note (for automation agents):
- If using SupabaseTools, ensure the RPC public.run_sql(text) exists to allow the tool to run SQL. If missing, create a SECURITY DEFINER function that executes dynamic SQL, or run assets/supabase_schema.sql manually.
