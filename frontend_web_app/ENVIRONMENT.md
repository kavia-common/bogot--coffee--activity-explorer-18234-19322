# Environment Setup

Create a `.env` file in the project root with:

REACT_APP_SUPABASE_URL=<your_supabase_url>
REACT_APP_SUPABASE_KEY=<your_supabase_anon_key>
# Optional if you want to render Google Maps:
REACT_APP_GOOGLE_MAPS_API_KEY=<your_google_maps_js_api_key>

Notes:
- Do not commit your real keys.
- The app uses Supabase for passwordless email login. The redirect URL uses window.location.origin.
- Ensure the Supabase auth settings allow email OTP and the redirect URL.
