# 👟 WIS Backend

**WIS Backend** is a modern API built with **NestJS + Prisma**, feat. UI doc with **Swagger UI**, feat. img. data **CLOUDINARY**, feat. AI service **OPENROUTER API**. Awesome, for WIS frontend.

---

## 📋 Stack 

- **Node.js**: v18 or higher
- **PostgreSQL**: Database (PgAdmin v17)
- **NPM**: Package manager
- **API**: Used API services: **OPENROUTER**, **CLOUDINARY**, **GOOGLE MAIL** 

---

## 🚀 Quick Start Guide

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory.

```env
# Server
PORT=3000

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/wis-db?schema=public"

# Auth
JWT_SECRET="your_super_secret_jwt_key"

# Email Service (Nodemailer)
MAIL_USER="your_email@gmail.com"
MAIL_PASS="your_email_app_password"

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# AI Integration (OpenRouter)
OPENROUTER_API_KEY="sk-or-..."
OPENROUTER_MODEL="google/gemini-2.0-flash-exp:free"
OPENROUTER_VISION_MODEL="nvidia/nemotron-nano-12b-v2-vl:free"
```

---

### 3. Database Setup

Initialize the database schema using Prisma:

```bash
# Generate Prisma Client
npx prisma generate

# Synch. DB with schema
npx prisma db push
```

---

### 4. Running the Application

```bash
# Dev mode
npm run start:dev

# Production build
npm run build
```

## 📚 API Documentation

The API is documented by Swagger. If the server is running, you can access the documentation at:

👉 [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## 📁 Project Structure

- `src/ai` - AI Chat & Vision logic
- `src/auth` - Authentication & User Management
- `src/blog` - Article Management (Admin & Public)
- `src/users` - User Profile operations
- `prisma/schema.prisma` - Database Schema

---

### 📢 Contact

```bash
👤 Author: Kimerland
📧 Email: kimerland.project@gmail.com
🐙 GitHub: Kimerland
```

---

### ⭐️ If you like this project, please give it a star!
