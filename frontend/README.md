# 🧵 Banasthali Khadi Bhandar — Full Stack E-Commerce

A full-stack e-commerce platform for authentic handwoven Khadi products, built to empower rural women of Rajasthan. Inspired by Flipkart's UI with a pink/dark theme.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [External Services Setup](#external-services-setup)
- [Running the Project](#running-the-project)
- [Role System](#role-system)
- [Setting Up Admin](#setting-up-admin)
- [Features](#features)
- [API Routes](#api-routes)
- [Common Errors & Fixes](#common-errors--fixes)
- [Folder Descriptions](#folder-descriptions)

---

## 🛠 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React.js, React Router v6, Axios, React Toastify |
| Backend    | Node.js, Express.js                             |
| Database   | MongoDB (Mongoose)                              |
| Auth       | JWT, OTP via Email, Google OAuth (Passport.js)  |
| Payments   | Razorpay                                        |
| Storage    | Cloudinary (images/videos) or Local disk        |
| Email      | Nodemailer (Gmail App Password)                 |

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   ├── mailer.js              # Nodemailer setup
│   │   ├── cloudinary.js          # Cloudinary + Multer config
│   │   ├── passport.js            # Google OAuth strategy
│   │   └── razorpay.js            # Razorpay instance
│   ├── controllers/
│   │   ├── authController.js      # Register, OTP, Profile
│   │   ├── productController.js   # CRUD + Cart
│   │   ├── orderController.js     # Place & track orders
│   │   ├── paymentController.js   # Razorpay create & verify
│   │   ├── adminController.js     # Admin panel logic
│   │   ├── sellerController.js    # Seller dashboard logic
│   │   ├── siteController.js      # Banners, categories, settings
│   │   ├── couponController.js    # Coupon CRUD & apply
│   │   ├── reviewController.js    # Product reviews
│   │   └── wishlistController.js  # Wishlist toggle & fetch
│   ├── middleware/
│   │   └── authMiddleware.js      # protect, admin, seller guards
│   ├── models/
│   │   ├── User.js                # Customer / Seller / Admin
│   │   ├── Product.js             # Products with categories array
│   │   ├── Order.js               # Orders with items
│   │   ├── Otp.js                 # OTP records
│   │   ├── Review.js              # Product reviews
│   │   ├── Wishlist.js            # User wishlists
│   │   ├── Coupon.js              # Discount coupons
│   │   ├── Banner.js              # Homepage banners
│   │   ├── Category.js            # Product categories
│   │   └── SiteSettings.js        # Global site settings
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── sellerRoutes.js
│   │   ├── siteRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── wishlistRoutes.js
│   │   └── uploadRoutes.js
│   ├── uploads/                   # Local uploaded files (auto-created)
│   ├── fixCategories.js           # One-time DB fix script
│   ├── server.js                  # Express app entry point
│   └── .env                       # ← YOU MUST CREATE THIS
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api.js                 # Axios instance with auth header
│   │   ├── App.js                 # All routes + Home page
│   │   ├── App.css                # Global + responsive styles
│   │   ├── context/
│   │   │   └── authContext.js     # User, cart, wishlist global state
│   │   ├── components/
│   │   │   ├── Header.js          # Sticky header with search + mobile menu
│   │   │   ├── ProductCard.js     # Product card with wishlist + quick add
│   │   │   └── BannerCarousel.js  # Homepage banner slider
│   │   └── pages/
│   │       ├── Login.js
│   │       ├── Register.js
│   │       ├── ForgotPassword.js
│   │       ├── GoogleAuthSuccess.js
│   │       ├── Home.js            # (inside App.js as component)
│   │       ├── Cart.js
│   │       ├── Checkout.js
│   │       ├── Orders.js
│   │       ├── OrderTracking.js
│   │       ├── Profile.js
│   │       ├── Wishlist.js
│   │       ├── SearchResults.js
│   │       ├── About.js
│   │       ├── ProductDetails.js
│   │       ├── seller/
│   │       │   ├── SellerSetup.js
│   │       │   └── SellerDashboard.js
│   │       └── admin/
│   │           └── AdminDashboard.js
│   └── .env                       # ← YOU MUST CREATE THIS
```

---

## ✅ Prerequisites

Before starting, make sure you have these installed:

| Tool        | Version  | Download |
|-------------|----------|----------|
| Node.js     | v18+     | https://nodejs.org |
| npm         | v9+      | Comes with Node.js |
| MongoDB     | v6+      | https://www.mongodb.com/try/download/community |
| Git         | Any      | https://git-scm.com |

---

## 🚀 Installation & Setup

### Step 1 — Clone or download the project

```bash
# If using git
git clone <your-repo-url>
cd project

# Or just navigate to your project folder
cd C:\Users\20050\OneDrive\Desktop\project
```

---

### Step 2 — Install backend dependencies

```bash
cd backend
npm install
```

This installs:
- express, mongoose, jsonwebtoken
- nodemailer, passport, passport-google-oauth20
- multer, cloudinary, multer-storage-cloudinary
- razorpay, bcryptjs, cors, dotenv, nodemon

---

### Step 3 — Install frontend dependencies

```bash
cd ../frontend
npm install
```

This installs:
- react, react-router-dom, axios
- react-toastify, @react-oauth/google

---

### Step 4 — Create environment files

#### `backend/.env` (create this file inside the `backend` folder)

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/khadi_bhandar

# JWT
JWT_SECRET=khadibhandar_secret_2024

# Email (Gmail)
EMAIL_USER=banasthalikhadibhandar@gmail.com
EMAIL_PASS=your_gmail_app_password_here

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx

# URLs
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:5000
PORT=5000
```

#### `frontend/.env` (create this file inside the `frontend` folder)

```env
REACT_APP_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 🔧 External Services Setup

### 1. Gmail App Password (for OTP emails)

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** if not already done
3. Go to **App Passwords** (search for it)
4. Select app: **Mail** → Device: **Windows Computer**
5. Click **Generate** → Copy the 16-character password
6. Paste it as `EMAIL_PASS` in `backend/.env`

> ⚠️ Use App Password, NOT your regular Gmail password

---

### 2. Cloudinary (image & video storage)

1. Go to https://cloudinary.com → Sign up free
2. Dashboard shows your **Cloud Name**, **API Key**, **API Secret**
3. Copy all three into `backend/.env`

> If Cloudinary is not set up, the app falls back to local disk storage in `backend/uploads/`

---

### 3. Razorpay (payments)

1. Go to https://razorpay.com → Sign up
2. Dashboard → **Settings** → **API Keys**
3. Click **Generate Test Key**
4. Copy **Key ID** and **Key Secret** into `backend/.env`
5. Add Razorpay script to `frontend/public/index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

### 4. Google OAuth (login with Google)

1. Go to https://console.cloud.google.com
2. Click **New Project** → Name: `Khadi Bhandar` → **Create**
3. Left menu → **APIs & Services** → **OAuth consent screen**
   - User Type: **External** → **Create**
   - App name: `Banasthali Khadi Bhandar`
   - Add your email → **Save and Continue** through all steps
4. Left menu → **Credentials** → **+ Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs → **+ Add URI**:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
   - Click **Create**
5. Copy **Client ID** and **Client Secret** into both `.env` files

---

## ▶️ Running the Project

Open **two terminals**:

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected ✅
Cloudinary connected ✅  (or local storage fallback)
```

### Terminal 2 — Frontend

```bash
cd frontend
npm start
```

Browser opens at **http://localhost:3000** 🎉

---

## 🔑 Role System

| Role     | What they can do |
|----------|-----------------|
| **Customer** | Browse, search, add to cart, checkout, orders, wishlist, reviews, profile |
| **Seller**   | Everything customer can + seller dashboard, add/edit/delete own products, manage own orders |
| **Admin**    | Everything seller can + admin panel, approve/reject sellers, manage all users/orders/products, banners, categories, coupons |

---

## 👑 Setting Up Admin

Admin cannot be created through the UI. You must set it directly in MongoDB:

### Option A — MongoDB Compass (GUI)

1. Open **MongoDB Compass**
2. Connect to `mongodb://localhost:27017`
3. Open database: `khadi_bhandar` → collection: `users`
4. Find your user → click **Edit**
5. Change `"role": "customer"` to `"role": "admin"`
6. Click **Update**

### Option B — MongoDB Shell

```bash
mongosh

use khadi_bhandar

db.users.updateOne(
  { email: "youremail@gmail.com" },
  { $set: { role: "admin" } }
)
```

After this, log in normally and you'll see the **Admin Panel** in the dropdown.

---

## ✨ Features

### 🛍️ Customer Features
- OTP-based email login/register (no password needed)
- Google Sign In / Sign Up
- Browse products by category, search, filters (price, rating, sort)
- Product details with size/color selection — must select before adding to cart
- Add to cart, update quantity, remove
- Wishlist — heart button on every product card
- Coupon codes at checkout
- Multiple payment methods — UPI, Card, Net Banking, Wallets, COD
- Razorpay integration for online payments
- Order tracking with status history
- Product reviews and star ratings (all logged-in users)
- Responsive — works on mobile, tablet, desktop

### 🏪 Seller Features
- Register as seller → Fill setup form (Aadhaar, PAN, Bank) → Admin approval
- Google Sign Up as Seller → Skip OTP → Fill setup form directly
- Sensitive fields (Aadhaar, PAN, Bank) have eye toggle to show/hide
- Add products with multiple categories (chip selector)
- Upload images: JPG/PNG from device (Cloudinary) OR paste URL
- Upload videos: MP4/WebM/MOV from device (Cloudinary) OR YouTube/URL
- Click uploaded image thumbnail to preview full size (lightbox)
- Edit/delete own products
- View and update order status
- Revenue dashboard

### ⚙️ Admin Features
- Dashboard with stats: users, sellers, products, orders, revenue
- Approve or reject seller applications
- Block/unblock customers
- View and update any order status
- Delete any product
- Manage homepage banners (upload image or URL, toggle active)
- Manage product categories (add emoji, toggle active)
- Create and manage discount coupons (% or flat, expiry, usage limit)

---

## 📡 API Routes

### Auth
```
POST   /api/auth/register          Register new user
POST   /api/auth/send-otp          Send OTP to email
POST   /api/auth/verify-otp        Verify OTP → login
GET    /api/auth/profile           Get profile (auth required)
PUT    /api/auth/profile           Update profile
POST   /api/auth/apply-seller      Submit seller setup form
GET    /api/auth/google            Start Google OAuth
GET    /api/auth/google/callback   Google OAuth callback
```

### Products
```
GET    /api/products               Get all (filter: search, category, price, sort)
GET    /api/products/:id           Get single product
POST   /api/products               Create (admin/seller)
PUT    /api/products/:id           Update (admin/seller)
DELETE /api/products/:id           Delete (admin/seller)
GET    /api/products/cart          Get cart
POST   /api/products/cart          Add to cart
PUT    /api/products/cart/:id      Update cart item
DELETE /api/products/cart/:id      Remove from cart
```

### Orders
```
POST   /api/orders                 Place order
GET    /api/orders/my              My orders
GET    /api/orders/:id             Order details
```

### Payments
```
POST   /api/payment/create-order   Create Razorpay order
POST   /api/payment/verify         Verify payment signature
```

### Reviews
```
GET    /api/reviews/:productId     Get product reviews (public)
POST   /api/reviews                Add review (any logged-in user)
DELETE /api/reviews/:id            Delete review (admin only)
```

### Wishlist
```
GET    /api/wishlist               Get wishlist
POST   /api/wishlist/toggle        Toggle product in wishlist
```

### Coupons
```
POST   /api/coupons/apply          Apply coupon code
GET    /api/coupons                Get all (admin)
POST   /api/coupons                Create (admin)
PUT    /api/coupons/:id            Update (admin)
DELETE /api/coupons/:id            Delete (admin)
```

### Site (Banners & Categories)
```
GET    /api/site/banners           Active banners (public)
GET    /api/site/banners/all       All banners (admin)
POST   /api/site/banners           Create banner (admin)
PUT    /api/site/banners/:id       Update banner (admin)
DELETE /api/site/banners/:id       Delete banner (admin)

GET    /api/site/categories        Active categories (public)
GET    /api/site/categories/all    All categories (admin)
POST   /api/site/categories        Create category (admin)
PUT    /api/site/categories/:id    Update (admin)
DELETE /api/site/categories/:id    Delete (admin)
```

### Upload
```
POST   /api/upload/image           Upload single image (Cloudinary)
POST   /api/upload/images          Upload multiple images
POST   /api/upload/video           Upload video (Cloudinary)
```

### Admin
```
GET    /api/admin/dashboard        Stats
GET    /api/admin/sellers          All sellers
PUT    /api/admin/sellers/:id/approve
PUT    /api/admin/sellers/:id/reject
GET    /api/admin/users            All customers
PUT    /api/admin/users/:id/toggle Block/unblock
GET    /api/admin/orders           All orders
PUT    /api/admin/orders/:id/status
GET    /api/admin/products         All products
DELETE /api/admin/products/:id
POST   /api/admin/upload/banner    Upload banner image
```

### Seller
```
GET    /api/seller/dashboard       Seller stats
GET    /api/seller/products        Seller's products
POST   /api/seller/products        Add product
PUT    /api/seller/products/:id    Edit product
DELETE /api/seller/products/:id    Delete product
GET    /api/seller/orders          Seller's orders
PUT    /api/seller/orders/:id/status
```

---

## 🐛 Common Errors & Fixes

### ❌ `Must supply cloud_name`
**Cause:** `dotenv.config()` not at top of `server.js` or `.env` missing  
**Fix:** Make sure `require('dotenv').config()` is the very **first line** of `server.js`

---

### ❌ `A <Route> is only ever to be used as the child of <Routes>`
**Cause:** `ProtectedRoute` returning a `<Route>` instead of children  
**Fix:** `ProtectedRoute` should return `children` directly, not wrap in `<Route>`

```js
// ✅ Correct
const ProtectedRoute = ({ children }) => {
  if (!token) return <Navigate to="/login" />;
  return children;
};
```

---

### ❌ OTP not received
**Cause:** Wrong Gmail App Password or 2FA not enabled  
**Fix:**
1. Enable 2-Step Verification on Gmail
2. Generate App Password (not regular password)
3. Put the 16-char app password (no spaces) in `EMAIL_PASS`

---

### ❌ Image upload failed
**Cause:** Cloudinary credentials missing or wrong  
**Fix:** Add debug log to `cloudinary.js`:
```js
console.log('Cloud:', process.env.CLOUDINARY_CLOUD_NAME); // should not be undefined
```
If undefined, `.env` is in wrong location or has wrong format (no quotes, no spaces around `=`)

---

### ❌ Google OAuth not working
**Cause:** Redirect URI not added in Google Console  
**Fix:** In Google Console → Credentials → OAuth Client → Add:
```
http://localhost:5000/api/auth/google/callback
```

---

### ❌ Men/Women filter showing wrong products
**Cause:** Products have mismatched case in `category` field  
**Fix:** Run the fix script once:
```bash
cd backend
node fixCategories.js
```

---

### ❌ `Cannot read properties of undefined (reading 'toUpperCase')`
**Cause:** Review submitted but `user.name` is undefined  
**Fix:** `reviewController.js` fetches user fresh from DB: `const user = await User.findById(req.user.id)`

---

## 📂 Folder Descriptions

### `backend/config/`
All external service configurations. Each file exports a configured instance.

### `backend/controllers/`
Business logic. Each controller handles one domain (auth, products, orders etc). Keep routes thin — all logic goes here.

### `backend/middleware/`
`authMiddleware.js` exports `protect` (any logged-in user), `admin` (admin only), `seller` (seller or admin), `approvedSeller` (approved seller or admin).

### `backend/models/`
Mongoose schemas. `Product.js` has both `category` (string, primary) and `categories` (array) — always keep them in sync. Use `fixCategories.js` to fix old data.

### `backend/uploads/`
Auto-created when first file is uploaded locally. Served at `http://localhost:5000/uploads/`. Not used if Cloudinary is configured.

### `frontend/src/context/authContext.js`
Global state for user, cart, wishlist. Provides `loginWithToken`, `logout`, `addToCart`, `toggleWishlist`, `isInWishlist`. Wrap your whole app with `<AuthProvider>`.

### `frontend/src/api.js`
Axios instance that automatically adds `Authorization: Bearer <token>` header from localStorage.

---

## 🌐 Production Deployment Notes

When deploying to production (not covered in detail here):

1. Change `FRONTEND_URL` and `BASE_URL` in `.env` to your actual domain
2. Add your production domain to Google OAuth allowed redirect URIs
3. Add your production domain to Razorpay webhook settings
4. Use a production MongoDB URI (MongoDB Atlas recommended)
5. Set `NODE_ENV=production` in `.env`
6. Build frontend: `cd frontend && npm run build`

---

## 📞 Contact

**Banasthali Khadi Bhandar**  
📧 banasthalikhadibhandar@gmail.com  
📍 Banasthali Vidyapith, Newai, Rajasthan — 304022  
📞 +91 98765 43210  

---

## 📄 License

This project was built for Banasthali Vidyapith's Khadi initiative to support rural women empowerment through e-commerce.