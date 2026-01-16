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

3. Set the Supabase environment variables:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

## 📦 Deployment

For detailed instructions on deploying this application to an Ubuntu VPS, including server setup, database configuration, and SSL/TLS setup, see [DEPLOYMENT.md](./DEPLOYMENT.md).

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
