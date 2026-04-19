# VaraLagbe Backend - Quick Start Guide

## 🚀 Getting Started

### 1. Navigate to the backend directory:

```bash
cd "h:\Project\App Development\VaraLagbe-backend"
```

### 2. Install MongoDB (if not already installed)

**Option A: Local MongoDB Installation**

- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017/varalagbe`

**Option B: MongoDB Atlas (Cloud)**

- Create account at: https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Copy connection string to `.env` MONGODB_URI

### 3. Configure Environment Variables

Edit `.env` file with your actual values:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_key
```

### 4. Start the Server

**Development Mode (with auto-reload):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

### 5. Test the Server

```bash
# Health check
curl http://localhost:5000/api/health

# Or open in browser:
http://localhost:5000/api/health
```

## 📋 Next Steps

1. **Test API Endpoints** - Use Postman or Insomnia
2. **Add More Models** - Create additional database schemas
3. **Add More Routes** - Create API endpoints for your features
4. **Add Authentication** - Implement role-based features
5. **Deploy** - Deploy to Heroku, AWS, or other platform

## 🔌 Connecting from React Native

In your React Native app, set the API base URL:

```javascript
const API_URL = "http://your-backend-url:5000/api";

// Example fetch request
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  return data;
};
```

## 📚 API Documentation

See `README.md` in the project root for complete API documentation.

## 🐛 Troubleshooting

**Port already in use:**

- Change PORT in .env file
- Or kill process on port 5000

**MongoDB connection failed:**

- Check MONGODB_URI in .env
- Ensure MongoDB is running
- Verify network connectivity

**CORS errors:**

- Update CORS_ORIGIN in .env with your React Native app's URL
- For Expo: `http://localhost:19000` or your actual IP

## 💡 Tips

- Use `.env` file for sensitive data (never commit to git)
- Keep `.env` in .gitignore
- Use `npm run dev` during development
- Install MongoDB Compass for easier database management
- Use Postman to test API endpoints

---

**Project Setup Complete!** 🎉
