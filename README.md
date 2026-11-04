# CampusCart 🛒🎓

A student-focused second-hand marketplace web app designed for campus communities to buy, sell, exchange, and donate items safely and conveniently.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router) with React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [lucide-react](https://lucide.dev/)
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Auth.js (NextAuth v5)](https://authjs.dev/) with Credentials & Google OAuth (JWT strategy, custom Mongoose User)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Media Optimization**: [Cloudinary](https://cloudinary.com/) + [sharp](https://sharp.pixelplumbing.com/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

---

## 📁 Directory Structure

```text
src/
├── app/                  # Next.js App Router pages, layouts, and API routes
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/           # Shared layouts (Navbar, Footer, Sidebar)
│   └── shared/           # Reusable compound UI components
├── features/             # Feature-based business domain modules
│   ├── auth/             # Login, register, auth session
│   ├── dashboard/        # User marketplace analytics & management
│   ├── enquiries/        # Structured enquiries and counter-offers
│   ├── favorites/        # Saved items / wishlist
│   ├── listings/         # Listing catalog, create, edit, search, filter
│   ├── notifications/    # In-app event alerts
│   └── sellers/          # Public profiles and seller stats
├── lib/
│   ├── db.ts             # Cached Mongoose connection singleton
│   ├── env.ts            # Type-safe Zod-validated environment config
│   ├── serialize.ts      # Mongo doc serialization helpers (lean -> client safe)
│   └── utils.ts          # Tailwind cn utility
├── models/               # Mongoose schemas and TypeScript interfaces
├── server/               # Server Actions, mutations, seed scripts
└── types/                # Shared TypeScript definitions
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- MongoDB connection URI (local instance or MongoDB Atlas cluster)

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
Fill in the values in `.env.local`:
- `MONGODB_URI`: Your MongoDB connection string
- `AUTH_SECRET`: Secret used by Auth.js to sign JWTs (generate with `npx auth secret`)
- `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`: Google OAuth credentials
- `CLOUDINARY_*`: Cloudinary cloud name, API key, and secret for image uploads
- `GEMINI_API_KEY`: API key for AI-assisted descriptions and categories

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

- `npm run dev`: Starts Next.js development server
- `npm run build`: Builds the production bundle
- `npm run start`: Starts production server
- `npm run lint`: Runs ESLint checks
- `npm run typecheck`: Runs TypeScript compiler check (`tsc --noEmit`)
- `npm run db:seed`: Seeds MongoDB with initial mock/test data via `tsx`
- `npm run format`: Formats codebase with Prettier
