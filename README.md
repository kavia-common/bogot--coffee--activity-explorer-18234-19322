# Bogotá Cafés & Plans (Workspace)

This workspace contains the frontend_web_app container for the responsive React application to explore cafés and plans in Bogotá.

Setup:
- Copy frontend_web_app/.env.example to frontend_web_app/.env and set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY (anon).
- In Supabase Dashboard, configure Auth URLs (include http://localhost:3000/**) and enable Email (magic link).
- Run assets/supabase_schema.sql in Supabase SQL editor to create tables and RLS.
- Roles supported: user, cafe_owner, superadmin (see assets/supabase.md).
- Start app: npm install && npm start inside frontend_web_app.

See frontend_web_app for full setup and run instructions.