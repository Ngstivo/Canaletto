# Canaletto Art Platform

Production-ready online course platform for art education.

## Project Structure

```
Canaletto/
├── frontend/          # Next.js 14 frontend
│   ├── src/
│   │   ├── app/      # App router pages
│   │   ├── components/  # Reusable components
│   │   ├── lib/      # Utility functions
│   │   └── types/    # TypeScript definitions
│   └── public/       # Static assets
│
└── backend/          # Express + TypeScript backend
    ├── src/
    │   ├── index.ts  # Server entry
    │   ├── routes/   # API routes
    │   ├── controllers/  # Business logic
    │   └── middleware/   # Auth, validation
    └── prisma/       # Database schema
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Backend

```bash
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
npm run db:push

# Start dev server
npm run dev
```

API runs on http://localhost:5000

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- NextAuth.js
- Zustand
- React Hook Form + Zod
- Stripe
- Video.js

**Backend:**
- Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Stripe API
- AWS SDK (S3, MediaConvert)

## Features

- 🎨 Art course platform with video streaming
- 🔐 Multi-role authentication (Student, Instructor, Admin)
- 💳 Stripe payment integration
- 📹 AWS-powered video processing
- 📊 Analytics and progress tracking
- 🎓 Course completion certificates

## Development

See [task.md](../.gemini/antigravity/brain/acc8266c-a906-407b-861e-41acaf0b9e20/task.md) for development roadmap.

## License

MIT © Canaletto Art School
