# CampusCart 🛒🎓
> **The modern, safe, student-focused second-hand marketplace for campus communities.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_%26_Local-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Tests-45BA4B?logo=playwright)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Overview

**CampusCart** connects students within university ecosystems to buy, sell, exchange, and donate textbooks, dorm furniture, electronics, and study essentials safely. Designed around verified campus communication, geospatial proximity, and structured offers, CampusCart eliminates marketplace spam and makes student trading transparent, reliable, and delightful.

The full Next.js application codebase is located in the [`campus_cart/`](./campus_cart) directory.

---

## 🛠 Tech Stack

- **Frontend & App Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling & UI Chrome:** Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Sonner Toasts
- **Database & ODM:** MongoDB 8.x, Mongoose 9.x (Compound, Text, TTL, 2dsphere indexes)
- **Authentication:** Auth.js (NextAuth.js v5 beta), Bcrypt.js
- **Media Optimization:** Sharp, Cloudinary SDK, HTML5 Canvas client-side compressor
- **Artificial Intelligence:** Google Gemini API (`@google/genai`)
- **Data Visualization & Tools:** Recharts, QRCode, Framer Motion (v14)
- **Testing & Verification:** Playwright (End-to-End browser tests), TSX (Regression test suites)

---

## 🚀 Quick Start

```bash
cd campus_cart
npm install
npm run db:seed
npm run dev
```

For the comprehensive guide, system architecture diagrams, Atlas setup, environment variables table, and Vercel deployment notes, please refer to:
👉 **[campus_cart/README.md](./campus_cart/README.md)**
