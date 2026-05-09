# Smart Library Management System

A premium, full-stack Library Management System built with React, TypeScript, and Supabase. Features a stunning glassmorphism design, real-time data tracking, and a robust admin panel.

## 🚀 Features

- **Dynamic Dashboard**: Real-time stats for catalog size, active loans, and overdue items.
- **Advanced Catalog**: Filter by category, search by title/author, and view detailed volume information.
- **Smart Issuing**: Automated stock management and loan tracking with due date calculation.
- **Personal Library**: Users can manage their issued books, track reading history, and monitor overdue status.
- **Admin Panel**: Full control over the inventory, including book addition with cover uploads and database seeding.
- **Premium UI**: Modern dark theme with glassmorphism effects and smooth animations.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS (via @tailwindcss/vite)
- **Backend**: Supabase (Auth, Database, Storage)
- **Database**: PostgreSQL (Supabase)
- **Styling**: Vanilla CSS + Glassmorphism

## 📁 Project Structure

```text
src/
├── components/     # Reusable UI components (Card, Navbar, Layout, etc.)
├── context/        # AuthContext for global user state
├── lib/            # Supabase client configuration
├── pages/          # Full-page components (Dashboard, Books, Admin, etc.)
├── services/       # API abstraction layer for Supabase interactions
├── types/          # TypeScript interfaces
└── utils/          # Helper functions and mock data
supabase/           # Database migrations and seed scripts
```

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Supabase Account

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Run the script in `supabase/migrations/20240501000000_initial_schema.sql`.
3. (Optional) Run `supabase/seed.sql` for initial book data.
4. Go to **Storage**, create a public bucket named `book_covers`.

### 4. Installation
```bash
npm install
npm run dev
```

## 🔒 Authentication & Roles
- **Student**: Can browse books, issue volumes, and view their history.
- **Admin**: Full access to the Admin Panel, can add/remove books and seed data.
- **Note**: Admin status is determined by the `role` column in the `profiles` table.

## 📄 License
MIT
