# Aerion — Premium Badminton Shuttlecocks

This is a full-stack e-commerce platform built with React, Vite, Node.js, Express, and MongoDB.

## 🚀 Deployment Guide (Recommended: Render.com)

We've configured the application to run as a single unit (Monolith) for easy deployment.

### 1. Database Setup (MongoDB Atlas)
1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (Free tier).
3. Under **Database Access**, create a user with a password.
4. Under **Network Access**, add `0.0.0.0/0` (or the IP of your hosting provider).
5. Copy your **Connection String**.

### 2. Hosting Setup (Render)
1. Sign in to [Render](https://render.com).
2. Create a new **Web Service**.
3. Connect your GitHub repository.
4. Use the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **Advanced** and add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `your_mongodb_connection_string`
   - `JWT_SECRET`: `a_long_random_secret_string`
   - `RAZORPAY_KEY_ID`: `your_razorpay_key_id`
   - `RAZORPAY_KEY_SECRET`: `your_razorpay_key_secret`
   - `PORT`: `10000` (Render's default)

### 3. Custom Domain Setup
1. In the **Render Dashboard**, go to your service's **Settings**.
2. Scroll to **Custom Domains** and click **Add Custom Domain**.
3. Enter your domain (e.g., `aerion.com`).
4. Update your domain registrar's DNS settings:
   - **A Record** (for `@`): Point to `216.24.57.1`
   - **CNAME Record** (for `www`): Point to your Render URL (e.g., `aerion.onrender.com`).
5. Render will automatically issue a **Free SSL Certificate** once verified.

### 4. Local Development
1. Clone the repo.
2. Run `npm install`.
3. Create a `.env` in the root (or use the one in `server/`).
4. Run `npm run dev` for the frontend.
5. Run `npm run server:dev` for the backend.
