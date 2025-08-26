# 📚 Online Bookstore API (NestJS + Prisma)

## 🚀 Project Overview

An **Online Bookstore API** built with **NestJS** and **Prisma ORM** (PostgreSQL), containerized with **Docker**, and deployable via **CI/CD pipelines**.

This project simulates a real-world e-commerce bookstore platform with:

- Role-based access control (Admin, Seller, Customer)
- Book catalog with advanced filtering/search
- Reviews & Ratings
- Cart & Order system with payments
- Notifications (Email + In-App)
- Admin analytics dashboard

---

## 🗂️ Modules

1. **Auth Module** – JWT authentication, 2FA (OTP/Google Authenticator)
2. **Users Module** – Roles: Admin, Seller, Customer
3. **Books Module** – Catalog, Search, Filters, Discounts, File Upload (PDF/Epub)
4. **Reviews Module** – Book reviews & ratings (only buyers can review)
5. **Cart Module** – Manage shopping cart
6. **Orders Module** – Order lifecycle (pending → paid → shipped → delivered)
7. **Payments Module** – Stripe/Payme integration, refunds
8. **Notifications Module** – Email (order confirmation), In-App notifications
9. **Analytics Module** – Reports on sales, users, searches

---

## 🗄️ Prisma Data Models

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  name          String
  role          Role           @default(CUSTOMER)
  isTwoFA       Boolean        @default(false)
  avatarUrl     String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  reviews       Review[]
  orders        Order[]
  notifications Notification[]
  wishlist      Wishlist[]
}

enum Role {
  ADMIN
  SELLER
  CUSTOMER
}

model Book {
  id          String      @id @default(cuid())
  title       String
  author      String
  isbn        String      @unique
  price       Float
  stock       Int         @default(0)
  fileUrl     String?
  coverImage  String?
  posterUrl   String?
  description String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  sellerId    String
  seller      User        @relation(fields: [sellerId], references: [id])
  reviews     Review[]
  orders      OrderItem[]
  wishlist    Wishlist[]
}

model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1–5
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  bookId    String
  user      User     @relation(fields: [userId], references: [id])
  book      Book     @relation(fields: [bookId], references: [id])
}

model Cart {
  id      String      @id @default(cuid())
  userId  String      @unique
  items   CartItem[]
  user    User        @relation(fields: [userId], references: [id])
}

model CartItem {
  id      String @id @default(cuid())
  cartId  String
  bookId  String
  qty     Int
  cart    Cart   @relation(fields: [cartId], references: [id])
  book    Book   @relation(fields: [bookId], references: [id])
}

model Order {
  id          String      @id @default(cuid())
  userId      String
  totalAmount Float
  status      OrderStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  items       OrderItem[]
  user        User        @relation(fields: [userId], references: [id])
  couponId    String?
  coupon      Coupon?     @relation(fields: [couponId], references: [id])
}

model OrderItem {
  id       String @id @default(cuid())
  orderId  String
  bookId   String
  qty      Int
  price    Float
  order    Order @relation(fields: [orderId], references: [id])
  book     Book  @relation(fields: [bookId], references: [id])
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
  user      User     @relation(fields: [userId], references: [id])
}

model Wishlist {
  id     String @id @default(cuid())
  userId String
  bookId String
  user   User   @relation(fields: [userId], references: [id])
  book   Book   @relation(fields: [bookId], references: [id])
}

model Coupon {
  id        String   @id @default(cuid())
  code      String   @unique
  discount  Float    // % yoki fix amount
  validFrom DateTime
  validTo   DateTime
  isActive  Boolean  @default(true)
  orders    Order[]
}
```

---

## 📤 API Response Examples

### 🧑‍💻 User Response

```json
{
  "id": "usr_123",
  "name": "Ali Valiyev",
  "email": "ali@example.com",
  "role": "CUSTOMER",
  "avatarUrl": "https://cdn.bookstore.com/avatars/usr_123.png",
  "createdAt": "2025-08-27T10:30:00.000Z",
  "updatedAt": "2025-08-27T11:00:00.000Z"
}
```

### 📚 Book Response

```json
{
  "id": "book_987",
  "title": "NestJS Mastery",
  "author": "John Doe",
  "isbn": "978-3-16-148410-0",
  "price": 25.5,
  "stock": 120,
  "coverImage": "https://cdn.bookstore.com/books/book_987-cover.jpg",
  "posterUrl": "https://cdn.bookstore.com/books/book_987-poster.jpg",
  "fileUrl": "https://cdn.bookstore.com/books/book_987.pdf",
  "description": "A deep dive into NestJS framework...",
  "seller": {
    "id": "usr_456",
    "name": "Book Seller",
    "avatarUrl": "https://cdn.bookstore.com/avatars/usr_456.png"
  },
  "rating": 4.7,
  "reviewsCount": 132,
  "createdAt": "2025-08-20T15:00:00.000Z"
}
```

### 🌟 Review Response

```json
{
  "id": "rev_321",
  "rating": 5,
  "comment": "Excellent book for learning NestJS!",
  "createdAt": "2025-08-26T09:00:00.000Z",
  "user": {
    "id": "usr_123",
    "name": "Ali Valiyev",
    "avatarUrl": "https://cdn.bookstore.com/avatars/usr_123.png"
  },
  "book": {
    "id": "book_987",
    "title": "NestJS Mastery",
    "coverImage": "https://cdn.bookstore.com/books/book_987-cover.jpg"
  }
}
```

### 🛒 Cart Response

```json
{
  "id": "cart_789",
  "userId": "usr_123",
  "items": [
    {
      "book": {
        "id": "book_987",
        "title": "NestJS Mastery",
        "coverImage": "https://cdn.bookstore.com/books/book_987-cover.jpg"
      },
      "qty": 2,
      "price": 25.5
    }
  ],
  "total": 51.0
}
```

### 📦 Order Response

```json
{
  "id": "ord_555",
  "status": "PAID",
  "totalAmount": 76.5,
  "createdAt": "2025-08-27T12:00:00.000Z",
  "items": [
    {
      "book": {
        "id": "book_987",
        "title": "NestJS Mastery",
        "coverImage": "https://cdn.bookstore.com/books/book_987-cover.jpg",
        "posterUrl": "https://cdn.bookstore.com/books/book_987-poster.jpg"
      },
      "qty": 3,
      "price": 25.5
    }
  ],
  "user": {
    "id": "usr_123",
    "name": "Ali Valiyev",
    "avatarUrl": "https://cdn.bookstore.com/avatars/usr_123.png"
  }
}
```

### 🔔 Notification Response

```json
{
  "id": "noti_001",
  "message": "Your order has been shipped!",
  "isRead": false,
  "createdAt": "2025-08-27T14:00:00.000Z",
  "user": {
    "id": "usr_123",
    "name": "Ali Valiyev",
    "avatarUrl": "https://cdn.bookstore.com/avatars/usr_123.png"
  }
}
```

---

## 🔥 Extra Features

1. 📌 **Wishlist / Favorites** – Save favorite books for later.
2. 🧩 **Recommendation System** – AI-powered suggestions (Frequently Bought Together, Similar Authors).
3. 💳 **Multiple Payment Methods** – Stripe, Payme, Click, PayPal.
4. 🏷️ **Discounts & Coupons** – Admin can create promo codes.
5. 🗂️ **Book Categories & Tags** – Organize books by genres & topics.
6. 🔍 **Advanced Search & Filtering** – Full-text search, price/rating filters.
7. 🏬 **Multi-Seller Marketplace** – Each seller manages their own catalog.
8. 🔔 **Event Log & Audit Trail** – Log user/system actions for security.
9. 📊 **Analytics & Reports** – Export sales & user activity reports.
10. 📱 **Mobile API Support** – REST + GraphQL for mobile apps.

---

## 🛠️ Development Roadmap

### Phase 1 – Setup

- [ ] Init NestJS + Prisma + PostgreSQL
- [ ] Setup Docker (Dockerfile + docker-compose)
- [ ] Auth Module (JWT, RBAC, 2FA optional)

### Phase 2 – Core Features

- [ ] Users (Admin, Seller, Customer)
- [ ] Books (CRUD + search + filter)
- [ ] Cart (add/remove items)
- [ ] Orders (CRUD + lifecycle)
- [ ] Payments (mock → Stripe/Payme)

### Phase 3 – Extra Features

- [ ] Reviews & Ratings
- [ ] Notifications (Email + In-App)
- [ ] Discounts & Coupons
- [ ] File Upload (Book PDFs)

### Phase 4 – Admin Tools

- [ ] Analytics Module
- [ ] Sales report APIs
- [ ] Search analytics

### Phase 5 – Production

- [ ] Tests (unit & e2e with Jest)
- [ ] CI/CD pipeline (GitHub Actions/GitLab CI)
- [ ] Deployment (Docker + Cloud)
- [ ] Monitoring (Prometheus + Grafana optional)

---

## 🔗 Tech Stack

- **Backend:** NestJS (TypeScript)
- **ORM:** Prisma + PostgreSQL
- **Auth:** JWT + 2FA (OTP)
- **Payments:** Stripe/Payme API
- **Notifications:** Nodemailer (Email), DB events
- **Infra:** Docker, Docker Compose
- **CI/CD:** GitHub Actions or GitLab CI
- **Tests:** Jest (unit + e2e)

---

## ✅ Expected Outcome

A **production-ready bookstore API** that demonstrates:

- Modular NestJS design
- Prisma ORM best practices
- Secure authentication/authorization
- E-commerce style workflows
- CI/CD + Docker deployment

This project is suitable for a **mid → senior-level backend portfolio**.
