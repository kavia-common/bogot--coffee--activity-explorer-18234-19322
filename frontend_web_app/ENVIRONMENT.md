# Environment Setup

Create a `.env` file in the project root with:

REACT_APP_SUPABASE_URL=<your_supabase_url>
REACT_APP_SUPABASE_KEY=<your_supabase_anon_key>
# Optional if you want to render Google Maps:
REACT_APP_GOOGLE_MAPS_API_KEY=<your_google_maps_js_api_key>

Notes:
- Do not commit your real keys.
- The app uses Supabase for passwordless email login. Redirects point to `${SITE_URL}/auth/callback`.
- Ensure the Supabase auth settings allow email OTP and these redirect URLs:
  * http://localhost:3000/**
  * Your production domain /**
- Create schema/RLS via assets/supabase_schema.sql
