# 📚 Online Bookstore API (NestJS + Prisma + OAuth)

## 🚀 Project Overview

An **Online Bookstore API** built with **NestJS** and **Prisma ORM (PostgreSQL)**, containerized with **Docker** and deployable via **CI/CD pipelines**.

This project simulates a real-world e-commerce bookstore platform with:

- ✅ Role-based access control (Super Admin, Admin, Seller, Customer, Moderator)
- ✅ **Multi-Authentication System (JWT + OAuth2 + 2FA)**
- ✅ **Google OAuth Integration**
- ✅ Book catalog with advanced filtering/search
- ✅ Reviews & Ratings
- ✅ Cart & Order system with payments
- ✅ Notifications (Email + In-App)
- ✅ Admin analytics dashboard

---

## 🔐 Authentication System

### Authentication Methods

1. **Traditional Email/Password** with JWT
2. **Google OAuth 2.0** integration
3. **Two-Factor Authentication (2FA)** with OTP/Google Authenticator
4. **Refresh Token** mechanism for secure sessions

### OAuth Providers

- ✅ **Google** (Primary implementation)
- 🔄 Facebook (Future)
- 🔄 GitHub (Future)
- 🔄 Apple (Future)

---

## 🗂️ Modules

- **Auth Module** – JWT authentication, OAuth2 (Google), 2FA (OTP/Google Authenticator)
- **OAuth Module** – Google OAuth integration, provider management
- **Users Module** – Roles: Super Admin, Admin, Seller, Customer, Moderator
- **Books Module** – Catalog, Search, Filters, Discounts, File Upload (PDF/Epub)
- **Reviews Module** – Book reviews & ratings (only buyers can review)
- **Cart Module** – Manage shopping cart
- **Orders Module** – Order lifecycle (pending → paid → shipped → delivered)
- **Payments Module** – Stripe/Payme integration, refunds
- **Notifications Module** – Email (order confirmation), In-App notifications
- **Analytics Module** – Reports on sales, users, searches
- **Wishlist Module** – Save favorite books
- **Coupons Module** – Discounts & promo codes
- **Audit Logs** – Event log for Admin/Super Admin

---

## 🗄️ Enhanced Prisma Data Models

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String        @id @default(cuid())
  email         String        @unique
  password      String?       // ✅ OAuth foydalanuvchilar uchun ixtiyoriy
  name          String
  firstName     String?       // ✅ OAuth ma'lumotlari
  lastName      String?       // ✅ OAuth ma'lumotlari
  role          Role          @default(CUSTOMER)
  isEmailVerified Boolean     @default(false) // ✅ email tasdiqlash
  isTwoFA       Boolean       @default(false)
  twoFASecret   String?       // ✅ 2FA secret key
  avatarUrl     String?       // ✅ foydalanuvchi avatari
  locale        String?       // ✅ foydalanuvchi tili
  timezone      String?       // ✅ vaqt zonasi
  lastLoginAt   DateTime?     // ✅ oxirgi kirish vaqti
  isActive      Boolean       @default(true)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  oauthAccounts OAuthAccount[]
  refreshTokens RefreshToken[]
  reviews       Review[]
  orders        Order[]
  notifications Notification[]
  wishlist      Wishlist[]
  auditLogs     AuditLog[]
  books         Book[]        @relation("UserBooks")
  cart          Cart?
}

model OAuthAccount {
  id           String @id @default(cuid())
  userId       String
  provider     OAuthProvider
  providerId   String // Google ID, Facebook ID, etc.
  accessToken  String?
  refreshToken String?
  expiresAt    DateTime?
  tokenType    String?
  scope        String?
  idToken      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@unique([userId, provider])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum OAuthProvider {
  GOOGLE
  FACEBOOK
  GITHUB
  APPLE
}

enum Role {
  SUPER_ADMIN
  ADMIN
  SELLER
  CUSTOMER
  MODERATOR
}

model Book {
  id          String       @id @default(cuid())
  title       String
  author      String
  isbn        String       @unique
  price       Float
  stock       Int          @default(0)
  fileUrl     String?
  coverImage  String?      // ✅ kitob muqovasi
  posterUrl   String?      // ✅ kitob posteri
  description String?
  categoryId  String?
  sellerId    String
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  seller      User         @relation("UserBooks", fields: [sellerId], references: [id])
  category    Category?    @relation(fields: [categoryId], references: [id])
  reviews     Review[]
  orders      OrderItem[]
  wishlist    Wishlist[]
  cartItems   CartItem[]
}

model Category {
  id    String @id @default(cuid())
  name  String
  books Book[]
}

model Review {
  id        String   @id @default(cuid())
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  bookId    String

  user User @relation(fields: [userId], references: [id])
  book Book @relation(fields: [bookId], references: [id])
}

model Cart {
  id     String     @id @default(cuid())
  userId String     @unique
  items  CartItem[]
  user   User       @relation(fields: [userId], references: [id])
}

model CartItem {
  id     String @id @default(cuid())
  cartId String
  bookId String
  qty    Int

  cart   Cart @relation(fields: [cartId], references: [id])
  book   Book @relation(fields: [bookId], references: [id])
}

model Order {
  id          String      @id @default(cuid())
  userId      String
  totalAmount Float
  status      OrderStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  couponId    String?

  items  OrderItem[]
  user   User   @relation(fields: [userId], references: [id])
  coupon Coupon? @relation(fields: [couponId], references: [id])
}

model OrderItem {
  id      String @id @default(cuid())
  orderId String
  bookId  String
  qty     Int
  price   Float

  order   Order @relation(fields: [orderId], references: [id])
  book    Book  @relation(fields: [bookId], references: [id])
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}

model Notification {
  id        String   @id @default(cuid())
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  userId    String

  user User @relation(fields: [userId], references: [id])
}

model Wishlist {
  id     String @id @default(cuid())
  userId String
  bookId String

  user User @relation(fields: [userId], references: [id])
  book Book @relation(fields: [bookId], references: [id])
}

model Coupon {
  id        String   @id @default(cuid())
  code      String   @unique
  discount  Float
  validFrom DateTime
  validTo   DateTime
  isActive  Boolean  @default(true)

  orders Order[]
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String
  userId    String?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])
}
```

---

## 🔐 Authentication Endpoints

### Traditional Authentication

```typescript
// POST /auth/register
{
  "email": "user@example.com",
  "password": "strongPassword123",
  "name": "John Doe"
}

// POST /auth/login
{
  "email": "user@example.com",
  "password": "strongPassword123"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER",
    "avatarUrl": null
  }
}
```

### Google OAuth Authentication

```typescript
// GET /auth/google
// Redirects to Google OAuth consent screen

// GET /auth/google/callback
// Handles Google OAuth callback

// OAuth Success Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_456",
    "email": "user@gmail.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "avatarUrl": "https://lh3.googleusercontent.com/a/...",
    "isEmailVerified": true,
    "locale": "en",
    "oauthAccounts": [
      {
        "provider": "GOOGLE",
        "providerId": "1234567890",
        "createdAt": "2025-08-27T10:30:00.000Z"
      }
    ]
  }
}
```

### Two-Factor Authentication (2FA)

```typescript
// POST /auth/2fa/setup
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU...",
  "secret": "JBSWY3DPEHPK3PXP",
  "backupCodes": ["123456", "789012", "345678"]
}

// POST /auth/2fa/verify
{
  "token": "123456"
}

// POST /auth/login-with-2fa
{
  "email": "user@example.com",
  "password": "strongPassword123",
  "token": "123456"
}
```

### Token Management

```typescript
// POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// POST /auth/logout
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// DELETE /auth/logout-all
// Revokes all refresh tokens for user
```

---

## 👤 Enhanced User Profiles

### Customer with OAuth

```json
{
  "id": "usr_123",
  "name": "Ali Valiyev",
  "firstName": "Ali",
  "lastName": "Valiyev",
  "email": "ali@gmail.com",
  "role": "CUSTOMER",
  "avatarUrl": "https://lh3.googleusercontent.com/a/ACg8ocJ...",
  "isEmailVerified": true,
  "locale": "en",
  "timezone": "Asia/Tashkent",
  "lastLoginAt": "2025-08-27T14:30:00.000Z",
  "createdAt": "2025-08-27T10:30:00.000Z",
  "oauthAccounts": [
    {
      "id": "oauth_001",
      "provider": "GOOGLE",
      "providerId": "1234567890",
      "createdAt": "2025-08-27T10:30:00.000Z"
    }
  ]
}
```

### User Settings

```json
{
  "id": "settings_123",
  "userId": "usr_123",
  "preferences": {
    "language": "en",
    "currency": "USD",
    "timezone": "Asia/Tashkent",
    "emailNotifications": true,
    "smsNotifications": false,
    "marketingEmails": true
  },
  "privacy": {
    "profileVisibility": "public",
    "showEmail": false,
    "showLastSeen": true
  }
}
```

---

## 🔧 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bookstore"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Frontend URLs
FRONTEND_URL="http://localhost:3001"
FRONTEND_SUCCESS_URL="http://localhost:3001/auth/success"
FRONTEND_ERROR_URL="http://localhost:3001/auth/error"

# 2FA
TWO_FA_SERVICE_NAME="Online Bookstore"

# File Upload
MAX_FILE_SIZE="50MB"
UPLOAD_FOLDER="uploads/"
ALLOWED_FILE_TYPES="pdf,epub,jpg,png,webp"

# Redis (for session management)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
```

---

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.1.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-google-oauth20": "^2.0.0",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.3",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "@types/passport-google-oauth20": "^2.0.11",
    "@types/passport-jwt": "^3.0.8",
    "@types/passport-local": "^1.0.35",
    "@types/bcrypt": "^5.0.0",
    "@types/speakeasy": "^2.0.7",
    "@types/qrcode": "^1.5.2",
    "@types/nodemailer": "^6.4.8",
    "prisma": "^5.0.0"
  }
}
```

---

## 🚀 API Endpoints Overview

### Authentication Endpoints

```
POST   /auth/register              # Traditional registration
POST   /auth/login                 # Traditional login
GET    /auth/google                # Google OAuth login
GET    /auth/google/callback       # Google OAuth callback
POST   /auth/refresh               # Refresh access token
POST   /auth/logout                # Logout (single device)
DELETE /auth/logout-all            # Logout (all devices)
POST   /auth/forgot-password       # Request password reset
POST   /auth/reset-password        # Reset password
POST   /auth/verify-email          # Verify email address
POST   /auth/resend-verification   # Resend verification email

# 2FA Endpoints
POST   /auth/2fa/setup             # Setup 2FA
POST   /auth/2fa/verify            # Verify 2FA token
POST   /auth/2fa/disable           # Disable 2FA
POST   /auth/login-with-2fa        # Login with 2FA
```

### User Management

```
GET    /users/profile              # Get current user profile
PUT    /users/profile              # Update profile
POST   /users/upload-avatar        # Upload profile picture
DELETE /users/avatar               # Remove profile picture
GET    /users/oauth-accounts       # List connected OAuth accounts
DELETE /users/oauth-accounts/:id   # Disconnect OAuth account
GET    /users/sessions             # List active sessions
DELETE /users/sessions/:id         # Terminate specific session
```

### Books & Catalog

```
GET    /books                      # List books with filters
GET    /books/:id                  # Get book details
POST   /books                      # Create book (Seller/Admin)
PUT    /books/:id                  # Update book (Owner/Admin)
DELETE /books/:id                  # Delete book (Owner/Admin)
POST   /books/:id/upload-cover     # Upload book cover
GET    /books/search               # Advanced search
GET    /categories                 # List categories
```

### Shopping & Orders

```
GET    /cart                       # Get user cart
POST   /cart/items                 # Add item to cart
PUT    /cart/items/:id             # Update cart item
DELETE /cart/items/:id             # Remove cart item
DELETE /cart                       # Clear cart

POST   /orders                     # Create order from cart
GET    /orders                     # List user orders
GET    /orders/:id                 # Get order details
PUT    /orders/:id/cancel          # Cancel order
```

### Admin & Analytics

```
GET    /admin/users                # List all users
PUT    /admin/users/:id/role       # Change user role
PUT    /admin/users/:id/status     # Activate/Deactivate user
GET    /admin/books                # List all books
PUT    /admin/books/:id/status     # Approve/Block book
GET    /admin/analytics            # Dashboard analytics
GET    /admin/audit-logs           # System audit logs
```

---

## 🔧 Development Roadmap

- **Phase 1** – Setup: NestJS, Prisma, Basic Auth ✅
- **Phase 2** – OAuth Integration: Google, JWT, 2FA ✅
- **Phase 3** – Core Features: Users, Books, Cart, Orders, Payments
- **Phase 4** – Extra Features: Reviews, Notifications, Coupons
- **Phase 5** – Admin Tools: Analytics, Audit Logs, User Management
- **Phase 6** – Advanced Features: Search, Recommendations, Multi-language
- **Phase 7** – Production: Tests, CI/CD, Deployment, Monitoring

---

## 🔗 Enhanced Tech Stack

- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**:
  - JWT (Access + Refresh Tokens)
  - Google OAuth 2.0
  - Two-Factor Authentication (TOTP)
- **Session Management**: Redis
- **Email**: Nodemailer (SMTP)
- **File Storage**: Local/AWS S3/CloudFlare R2
- **Payments**: Stripe/Payme Integration
- **Infrastructure**: Docker, GitHub Actions CI/CD
- **Monitoring**: Winston Logging, Sentry Error Tracking
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest

---

## 🛡️ Security Features

- ✅ **JWT with Refresh Tokens**
- ✅ **OAuth 2.0 Integration (Google)**
- ✅ **Two-Factor Authentication (2FA)**
- ✅ **Rate Limiting & Throttling**
- ✅ **CORS Protection**
- ✅ **Helmet Security Headers**
- ✅ **Password Hashing (bcrypt)**
- ✅ **Email Verification**
- ✅ **Session Management**
- ✅ **Input Validation & Sanitization**
- ✅ **Audit Logging**
- ✅ **Role-based Access Control (RBAC)**
