# Canaletto Platform - Deployment Guide

Complete guide to deploy frontend to Vercel and backend to Render.

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository pushed
- [ ] Stripe account created
- [ ] PostgreSQL database ready (or will create on Render)
- [ ] AWS S3 bucket created (optional)
- [ ] Domain name (optional)

---

## 🎯 Part 1: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `canaletto-db`
   - **Database:** `canaletto`
   - **User:** `canaletto_user`
   - **Region:** Choose closest to your users
   - **Plan:** Free (or paid for production)
3. Click **"Create Database"**
4. **Save the Internal Database URL** (starts with `postgresql://`)

### Step 3: Create Web Service for Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Ngstivo/Canaletto`
3. Configure:
   - **Name:** `canaletto-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npx prisma db push`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid)

### Step 4: Set Environment Variables
In Render dashboard, add these environment variables:

```
DATABASE_URL = <your-render-database-url>
JWT_SECRET = <generate-random-string>
PORT = 10000
NODE_ENV = production
FRONTEND_URL = <will-add-after-vercel>

STRIPE_SECRET_KEY = sk_live_...
STRIPE_WEBHOOK_SECRET = whsec_...

AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = <your-key>
AWS_SECRET_ACCESS_KEY = <your-secret>
AWS_S3_BUCKET = canaletto-uploads
AWS_CLOUDFRONT_URL = <your-cdn-url>
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Your backend URL: `https://canaletto-backend.onrender.com`

### Step 6: Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://canaletto-backend.onrender.com/api/payment/webhook`
4. Events to send: `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Update `STRIPE_WEBHOOK_SECRET` in Render

---

## 🚀 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import project

### Step 2: Import Project
1. Click **"Add New..." → "Project"**
2. Select **"Import Git Repository"**
3. Choose `Ngstivo/Canaletto`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

### Step 3: Set Environment Variables
In Vercel project settings, add:

```
NEXT_PUBLIC_API_URL = https://canaletto-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
NEXTAUTH_SECRET = <generate-random-string>
NEXTAUTH_URL = https://your-app.vercel.app
```

> **Tip:** Generate NEXTAUTH_SECRET with: `openssl rand -base64 32`

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Your frontend URL: `https://canaletto-xxx.vercel.app`

### Step 5: Update Backend FRONTEND_URL
1. Go back to Render
2. Update environment variable:
   ```
   FRONTEND_URL = https://canaletto-xxx.vercel.app
   ```
3. Render will auto-redeploy

---

## 🔄 Post-Deployment Configuration

### Update CORS Origins
The backend is already configured to use `FRONTEND_URL` from environment variables. Verify in `backend/src/index.ts`:
```typescript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})
```

### Test the Deployment
1. **Visit your Vercel URL**
2. **Register a new account**
3. **Create a test course** (as instructor)
4. **Test payment flow** with Stripe test card: `4242 4242 4242 4242`
5. **Watch a video lecture**
6. **Check progress tracking**

---

## 🎨 Custom Domain (Optional)

### For Vercel (Frontend)
1. Go to Vercel project **Settings → Domains**
2. Add your domain: `www.canaletto.art`
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your domain

### For Render (Backend)
1. Go to Render service **Settings → Custom Domain**
2. Add: `api.canaletto.art`
3. Update DNS records
4. Update `NEXT_PUBLIC_API_URL` in Vercel

---

## 📊 Monitoring & Logs

### Vercel
- **Deployments:** Real-time deployment logs
- **Analytics:** Built-in analytics
- **Logs:** Runtime logs in dashboard

### Render
- **Logs:** Real-time logs in dashboard
- **Metrics:** CPU, memory usage
- **Events:** Deployment history

---

## 🔒 Security Checklist

- [ ] All environment variables set correctly
- [ ] Stripe webhook signature verified
- [ ] Database has strong password
- [ ] JWT_SECRET is random and secure
- [ ] NEXTAUTH_SECRET is random and secure
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic on Vercel/Render)

---

## 💰 Costs

### Free Tier
- **Vercel:** Unlimited hobby projects
- **Render:** 
  - PostgreSQL: Free (1GB storage, expires after 90 days)
  - Web Service: Free (512MB RAM, sleeps after inactivity)

### Paid (Recommended for Production)
- **Vercel Pro:** $20/month
- **Render PostgreSQL:** $7/month (25GB)
- **Render Web Service:** $7/month (512MB RAM, always on)

**Total:** ~$34/month for production-ready setup

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check DATABASE_URL format in Render
postgresql://user:pass@host:5432/dbname
```

**Prisma Not Found:**
```bash
# Render build command should include:
npm install && npx prisma generate && npx prisma db push
```

**CORS Error:**
```bash
# Verify FRONTEND_URL matches your Vercel URL exactly
FRONTEND_URL=https://canaletto-xxx.vercel.app
```

### Frontend Issues

**API Not Reachable:**
```bash
# Check NEXT_PUBLIC_API_URL in Vercel
# Must NOT have trailing slash
NEXT_PUBLIC_API_URL=https://canaletto-backend.onrender.com
```

**Auth Not Working:**
```bash
# Verify NEXTAUTH_URL matches deployment URL
NEXTAUTH_URL=https://your-app.vercel.app
```

**Stripe Issues:**
```bash
# Use live keys (pk_live_... and sk_live_...)
# Update webhook endpoint to production URL
```

---

## 🎉 Success!

Your Canaletto platform is now live! 

**Frontend:** https://your-app.vercel.app
**Backend:** https://canaletto-backend.onrender.com

**Next steps:**
1. Create your first course
2. Test enrollment flow
3. Monitor usage and performance
4. Invite beta testers
5. Launch! 🚀

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Stripe Docs:** https://stripe.com/docs

---

**Happy Deploying! 🎨**
