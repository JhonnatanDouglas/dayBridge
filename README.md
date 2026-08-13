# DayBridge

DayBridge is a small React Native application built with Expo to demonstrate a complete mobile-first flow for a technical interview.

The app lets users create an account, sign in with Supabase Auth, fetch public holidays from the Nager.Date API, and save selected holidays to a private PostgreSQL-backed list protected by Row Level Security.

## Live Links

Production app:

```text
https://daybridge-jhonnatandev.expo.app/sign-in
```

Latest preview deployment:

```text
https://daybridge-jhonnatandev--fa8saue9le.expo.app
```

Supabase dashboard, requires project access:

```text
https://supabase.com/dashboard/project/zobcwmoqduzlqoafjmih/
```

Expo dashboard, requires project access:

```text
https://expo.dev/accounts/jhonnatandev-team
```

## What It Does

- Creates real user accounts with email and password.
- Handles email confirmation and confirmation email resend.
- Keeps the Supabase session persisted between reloads.
- Protects authenticated routes with Expo Router.
- Fetches upcoming public holidays for Brazil, United States, United Kingdom, and Canada.
- Uses `GB` internally for the United Kingdom API code, but shows `UK` in the UI.
- Saves and removes holidays from a private user list.
- Shows loading, empty, error, retry, disabled, and pending states.
- Uses PostgreSQL and RLS as the permanent source for saved holidays.

## Stack

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript strict mode
- Expo Router
- NativeWind 4
- Supabase Auth
- Supabase PostgreSQL with Row Level Security
- React Hook Form
- Zod
- Lucide React Native
- Jest with `jest-expo`
- ESLint and Prettier
- EAS Hosting for web deployment

## Project Structure

```text
app/
  Expo Router routes and screen composition.

src/components/
  Shared UI components.

src/features/auth/
  Auth forms, validation schemas, and Supabase auth service.

src/features/holidays/
  Nager.Date client, DTO mapping, date helpers, hooks, and holiday UI.

src/features/saved-holidays/
  Supabase saved holiday service, shared state, hooks, and saved list UI.

src/lib/
  Environment config, Supabase client, and database types.

src/providers/
  Session provider and auth state restoration.

supabase/migrations/
  SQL migration for saved_holidays, indexes, permissions, and RLS policies.

docs/
  Portuguese explanation of how the project works.
```

## Requirements

- Node.js 22 LTS or newer
- npm
- Expo account
- Supabase project
- Git Bash, PowerShell, or another terminal

Install EAS CLI when you want to deploy:

```bash
npm install --global eas-cli
```

## Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill the file with Supabase public values:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

Do not use a `service_role` key in this app. It is a privileged server secret and must never be shipped to the client.

## Supabase Setup

1. Open the Supabase dashboard.
2. Go to `SQL Editor -> New query`.
3. Run the SQL from:

```text
supabase/migrations/0001_create_saved_holidays.sql
```

4. Go to `Authentication -> Providers -> Email`.
5. Keep Email enabled.
6. Keep email confirmation enabled if you want to test the real confirmation flow.
7. Go to `Authentication -> URL Configuration`.

Use this for production:

```text
Site URL:
https://daybridge-jhonnatandev.expo.app

Redirect URLs:
https://daybridge-jhonnatandev.expo.app/**
https://daybridge-jhonnatandev--fa8saue9le.expo.app/**
http://localhost:8081/**
http://localhost:8082/**
```

If you create a new preview deployment, add its preview URL to `Redirect URLs` as well.

## Email Confirmation Notes

The app supports resending the signup confirmation email.

Supabase's default email provider is limited. In current Supabase docs, the built-in provider is intended for development and can be limited to a very small number of emails per hour. If confirmation emails stop arriving, check:

- `Authentication -> Logs`
- spam and promotions folders
- `Authentication -> SMTP Settings`

For a reliable demo or production app, configure a custom SMTP provider such as Resend, Brevo, SendGrid, Postmark, or AWS SES.

## Run Locally

Git Bash on this machine:

```bash
cd "/c/Users/jhonn/OneDrive/Área de Trabalho/APP React Native"
npm ci
npm run web -- --clear
```

PowerShell:

```powershell
cd "C:\Users\jhonn\OneDrive\Área de Trabalho\APP React Native"
npm ci
npm run web -- --clear
```

The app usually opens at:

```text
http://localhost:8081
```

If that port is busy:

```bash
npm run web -- --port 8082 --clear
```

For Expo Go or an emulator:

```bash
npm start
```

If the phone cannot reach the local network:

```bash
npx expo start --tunnel
```

## Quality Commands

Run everything:

```bash
npm run check
```

Individual commands:

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
```

Format files:

```bash
npm run format
```

## Web Build

Create the static web export:

```bash
npx expo export --platform web
```

This writes the web build to:

```text
dist/
```

That is the Expo equivalent of a Vite production build for this project.

## Deploy Preview

Use preview deploys for testing and sharing a temporary build URL:

```bash
npx expo export --platform web
npx eas-cli@latest deploy
```

The preview URL looks like this:

```text
https://daybridge-jhonnatandev--DEPLOYMENT_ID.expo.app
```

Each preview deployment is immutable. A new deploy creates a new URL with a different deployment ID.

## Deploy Production

Use production deploys for the stable interview/demo URL:

```bash
npx expo export --platform web
npx eas-cli@latest deploy --prod
```

Production URL:

```text
https://daybridge-jhonnatandev.expo.app
```

If production shows `No worker deployment was found matching the current domain`, run the production deploy again or wait a short time for the alias to propagate.

## Normal Update Flow

After changing the app:

```bash
npm run check
npx expo export --platform web
npx eas-cli@latest deploy
```

After testing preview and deciding it is ready:

```bash
npx expo export --platform web
npx eas-cli@latest deploy --prod
```

## Architecture Decisions

- Expo Router keeps route files thin and delegates business logic to `src/`.
- Supabase handles authentication, password storage, token refresh, and session persistence.
- AsyncStorage is used only by Supabase session persistence on native platforms.
- Nager.Date DTOs are mapped into an internal `Holiday` model before reaching the UI.
- Holiday IDs are deterministic and based on country, date, and name.
- Saved holidays are persisted in PostgreSQL, not in the external API.
- RLS is enforced in the database, not only through frontend filtering.
- The app avoids global state libraries because the MVP only needs small shared state for saved holidays.
- NativeWind 4 is used for styling; NativeWind 5 was avoided because it is still a prerelease line.

## Database Model

Main table:

```text
saved_holidays
- id uuid primary key
- user_id uuid references auth.users(id) on delete cascade
- external_id text
- country_code text
- holiday_date date
- local_name text
- name text
- created_at timestamptz
```

Important constraints and policies:

- unique `(user_id, external_id)`
- index `(user_id, holiday_date)`
- RLS enabled
- authenticated users can only select their own rows
- authenticated users can only insert rows with their own `user_id`
- authenticated users can only delete their own rows
- anonymous users do not get table permissions

## Public API

Nager.Date endpoint:

```text
GET https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}
```

The app fetches the current year and the next year, merges the results, removes duplicates, sorts by date, and only shows upcoming holidays.

Supported countries:

```text
BR - Brazil
US - United States
UK - United Kingdom, sent to the API as GB
CA - Canada
```

## Interview Summary

Use this explanation:

```text
I built DayBridge as a time-boxed React Native application with Expo and TypeScript. Users can authenticate with Supabase, fetch public holidays from Nager.Date, and save selected dates to a private PostgreSQL-backed list. I separated the provider DTO from the internal model, handled loading, error, empty, retry, and pending states, and used Supabase Row Level Security so each user can only access their own saved holidays. I kept the architecture intentionally small and easy to explain instead of adding a custom backend before the product needed one.
```

## Current Limitations

- Email delivery depends on Supabase Auth email configuration and SMTP limits.
- Offline sync is not implemented.
- The app shows chronological lists, not a full monthly calendar.
- It does not integrate with Google Calendar, Microsoft Graph, push notifications, analytics, or a custom backend.
- Weather data is intentionally out of scope for the MVP.

## Troubleshooting

If the app opens a configuration screen:

```text
Check .env and restart Expo.
```

If saved holidays fail:

```text
Confirm the Supabase migration was executed and RLS policies exist.
```

If login says the email is not confirmed:

```text
Confirm the email or use the resend button after the cooldown reaches zero.
```

If resend returns success but no email arrives:

```text
Check Supabase Authentication Logs and SMTP Settings.
```

If production URL shows no deployment:

```bash
npx eas-cli@latest deploy --prod
```

If Expo web keeps old styles:

```bash
npm run web -- --clear
```

Then hard-refresh the browser with `Ctrl + Shift + R`.
