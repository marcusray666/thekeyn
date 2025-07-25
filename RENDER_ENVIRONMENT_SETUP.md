# 🔧 Render Environment Variables Setup

## Required Variables for Basic Deployment

### DATABASE_URL (Required)
```
postgresql://username:password@host:port/database_name
```
**Get free database from [neon.tech](https://neon.tech)**

### STRIPE_SECRET_KEY (Optional - Test Key)
```
sk_test_51234567890abcdefghijklmnopqrstuvwxyz1234567890
```
**This is a fake test key that prevents the error**

## 🎯 Quick Setup Steps

1. **In Render Environment Variables:**
   - Click "Add Environment Variable"
   - Add these two variables
   - Click "Save and deploy"

2. **Test Keys Work Perfect:**
   - Your backend will start without errors
   - Payment features will be disabled (which is fine)
   - All other features work normally

3. **Later, Add Real Keys:**
   - When you want payments, replace with real Stripe keys
   - Get real keys from [stripe.com](https://stripe.com)

## ✅ Success Result
Your backend will show:
```
🚀 Backend server running on port 10000
✅ Database connected successfully
✅ Stripe initialized successfully (test mode)
```

Perfect for development and testing!