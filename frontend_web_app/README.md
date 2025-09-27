# Bogotá Cafés & Plans — Frontend

Responsive React app to discover cafés and plans in Bogotá with an Airbnb-style synchronized list and map, advanced filters with URL sync, role-based dashboards, and Supabase auth/storage.

## Tech
- React 18 + react-router-dom
- Supabase (auth + data): requires REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY
- Google Maps JS API (optional for real map rendering)
- Modern, minimal CSS (Ocean Professional theme)

## Environment
Copy `.env.example` to `.env` and fill keys:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- REACT_APP_SITE_URL (optional; defaults to window.location.origin)
- REACT_APP_GOOGLE_MAPS_API_KEY (optional, enables real map)

See ENVIRONMENT.md for details.

IMPORTANT: Supabase Configuration
1. In Supabase Dashboard > Authentication > URL Configuration
   - Set Site URL to your prod domain, add redirects:
     * http://localhost:3000/**
     * https://yourapp.com/**
2. Enable Email (Magic Link) provider
3. Run the SQL in assets/supabase_schema.sql to create tables and RLS
4. Roles:
   - profiles.role supports: user, cafe_owner, superadmin
   - Promote via: update public.profiles set role='cafe_owner' where id='<uuid>';
5. Callback route is /auth/callback

## Run
- npm install
- npm start

## Features
- Explore: left sidebar list (filters + results), right map with markers
- Filters synced to URL: q, nei, price, tags
- Mobile: stacked layout + floating map button
- Dashboards by role (user, cafe_owner, superadmin)
- Email magic-link auth via Supabase

Note: Data is mocked for the MVP. Connect Supabase tables "cafes" and "plans" to replace mock loading.
