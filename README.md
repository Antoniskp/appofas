# ✨ Appofas - Task Management Application

A professional task management system with user authentication, role-based access, and enterprise-grade architecture built with React, TypeScript, and Supabase.

## Features

- User authentication with GitHub OAuth via Supabase
- Task management (Create, Read, Update, Delete)
- Multiple view layouts (Kanban board, List view, Calendar view)
- Task filtering and search
- Role-based access control
- Clean service-layer architecture

## 🚀 Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Antoniskp/appofas.git
cd appofas
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (see `.env.example`) with your Supabase environment variables:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser at `http://localhost:5173`

### Local Supabase (No Supabase Dashboard Required)

You can run Supabase entirely on your machine without creating a project on supabase.com.

1. Install the Supabase CLI:
```bash
npm install -g supabase
```
Other install options (Homebrew/Scoop), Node.js requirements, and npm permission guidance are listed in the [Supabase CLI docs](https://supabase.com/docs/guides/cli).

2. Initialize and start the local stack:
```bash
supabase init
supabase start
```

3. Copy the local API URL and anon key into your `.env` file:
```bash
supabase status
```
Copy the `API URL` and `anon key` values from the output into `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

4. Create the tables using the SQL in the **Database Configuration** section of [DEPLOYMENT.md](./DEPLOYMENT.md). You can run the SQL in Supabase Studio at `http://localhost:54323` or add it to a local migration (`supabase migration new init_schema`), paste the SQL into the generated file, and run `supabase db reset`.

> Note: This app uses GitHub OAuth. After `supabase init` creates `supabase/config.toml`, configure a GitHub OAuth app in the `auth.external.github` section, for example:
> ```toml
> [auth.external.github]
> enabled = true
> client_id = "env(GITHUB_CLIENT_ID)"
> secret = "env(GITHUB_SECRET)"
> ```
> Set your GitHub OAuth app callback URL to `http://localhost:54321/auth/v1/callback`, and ensure `http://localhost:5173` is allowed in the `auth.site_url`/`auth.additional_redirect_urls` settings.

### Self-hosted Supabase (Postgres) on a Server

If you prefer not to use Supabase Cloud, you can run the Supabase Docker stack (PostgreSQL + Auth + REST) alongside the app on your own server. The deployment guide includes full instructions, but the short version is:

1. Install Docker and the Supabase CLI on the server.
2. From the repository root: `supabase init`, then update `supabase/config.toml` with GitHub OAuth settings and `auth.site_url` for your domain.
3. Run `supabase start` to launch the services.
4. Use `supabase status` to copy the public API URL and anon key into `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Run the schema SQL from [DEPLOYMENT.md](./DEPLOYMENT.md) in Supabase Studio or a migration.

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

## 📦 Deployment

For detailed instructions on deploying this application to an Ubuntu VPS, including server setup, database configuration, and SSL/TLS setup, see [DEPLOYMENT.md](./DEPLOYMENT.md). A helper script (`./deploy.sh`) is available to install dependencies and build the production bundle on the server.

## 🧠 Tech Stack

- **Frontend**: React 19, TypeScript
- **UI Framework**: Tailwind CSS, Radix UI
- **Build Tool**: Vite
- **State Management**: TanStack Query
- **Storage**: Supabase (PostgreSQL)
- **Icons**: Phosphor Icons, Heroicons, Lucide React

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run optimize` - Optimize Vite dependencies

## 🧹 Just Exploring?

No problem! If you were just checking things out and don't need to keep this code:

- Simply delete your local copy.
- Everything will be cleaned up — no traces left behind.

## 📄 License

Licensed under the terms of the MIT license.
