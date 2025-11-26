# Canaletto Art Platform

A production-ready online course platform for Canaletto Art School with secure video streaming, payment processing, and comprehensive dashboards.

## 🎯 Features

### ✅ Complete (Phases 1-7)

**Authentication & User Management**
- NextAuth.js with JWT authentication
- Role-based access control (Student, Instructor, Admin)
- Password reset flow with tokens
- Rate limiting and CSRF protection
- User profiles with editable information

**Course Management**
- Full CRUD operations for courses
- Section and lecture management
- Multiple content types (Video, PDF, Text, Quiz)
- Draft/Published/Archived status
- Course filtering and search
- Unique slug generation

**Payment Integration**
- Stripe Checkout for course enrollment
- Webhook-based automatic enrollment
- Customer ID management
- Payment history tracking
- Enrollment status verification

**File Uploads**
- AWS S3 integration with pre-signed URLs
- Direct browser-to-S3 uploads
- Progress tracking
- File type and size validation
- Organized folder structure

**Video Player & Learning**
- Video.js player with full controls
- Playback speed control (0.5 - 2x)
- Enrollment-protected access
- Lecture navigation sidebar
- Multi-format content support

**Progress Tracking**
- Auto-save video progress (every 10s)
- Lecture completion marking
- Course progress calculation
- Continue watching dashboard
- Student course overview

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios
- **Video:** Video.js
- **Payments:** Stripe.js

### Backend
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT
- **Payments:** Stripe API
- **Storage:** AWS S3
- **Security:** Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
Canaletto/
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utilities
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── backend/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, rate limiting
│   │   ├── services/       # S3, password reset
│   │   └── config/         # Database config
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Stripe account
- AWS S3 bucket (optional for uploads)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ngstivo/Canaletto.git
cd Canaletto
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Environment Setup**

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/canaletto"
JWT_SECRET="your-secret-key"
PORT=5000
FRONTEND_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3 (optional)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET="canaletto-uploads"
AWS_CLOUDFRONT_URL="https://cdn.domain.com"
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Database Setup**
```bash
cd backend
npx prisma generate
npx prisma db push
```

5. **Run Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor/admin)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Content Management
- `POST /api/content/courses/:id/sections` - Add section
- `POST /api/content/sections/:id/lectures` - Add lecture
- `DELETE /api/content/sections/:id` - Delete section
- `DELETE /api/content/lectures/:id` - Delete lecture

### Payments
- `POST /api/payment/create-checkout-session` - Create Stripe session
- `POST /api/payment/webhook` - Stripe webhook
- `GET /api/payment/enrollments` - Get user enrollments
- `GET /api/payment/enrollment/:courseId` - Check enrollment

### Progress
- `POST /api/progress/save` - Save video progress
- `PATCH /api/progress/lectures/:id/complete` - Mark complete
- `GET /api/progress/courses/:id` - Get course progress
- `GET /api/progress/continue-watching` - Get recent progress

### Uploads
- `POST /api/upload/get-upload-url` - Get S3 pre-signed URL
- `POST /api/upload/confirm-upload` - Confirm upload

## 🎨 Key Features Breakdown

### For Students
- Browse and enroll in courses
- Secure payment with Stripe
- Watch video lectures with progress tracking
- Resume from where you left off
- Track course completion
- Download PDF resources

### For Instructors
- Create and manage courses
- Upload videos and resources
- Organize content with sections
- Set pricing and discounts
- View enrolled students
- Track course performance

### For Admins
- Full platform access
- User management
- Course approval
- Revenue tracking

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CSRF protection
- Rate limiting on sensitive endpoints
- Helmet.js security headers
- Stripe webhook signature verification
- Enrollment-based content access
- AWS S3 pre-signed URLs

## 📈 Database Schema

Main models:
- **User** - Authentication and profiles
- **Course** - Course information
- **CourseSection** - Course organization
- **Lecture** - Individual lessons
- **Enrollment** - Student-course relationship
- **Progress** - Video playback tracking
- **Review** - Course reviews

## 🧪 Testing

**Development Testing:**
- Stripe test mode with test cards
- Local S3 testing with Stripe CLI
- Manual enrollment flow testing

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 9995`

## 🚢 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway/Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Database (Neon/PlanetScale)
1. Create database instance
2. Run migrations: `npx prisma db push`
3. Update DATABASE_URL

## 📝 License

Copyright © 2025 Canal etto Art School

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@canaletto.art or open an issue on GitHub.

---

**Built with ❤️ for Canaletto Art School**
