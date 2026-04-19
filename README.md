# VaraLagbe Backend API

A Node.js backend API for the VaraLagbe React Native application, built with Express.js, MongoDB, and Mongoose.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Authentication](#authentication)

## ✨ Features

- User authentication (Register/Login)
- JWT Token-based authentication
- Password hashing with bcryptjs
- Role-based access control (User/Admin)
- User profile management
- MongoDB integration with Mongoose
- CORS enabled for React Native clients
- Error handling and validation
- Environment configuration

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **CORS**: cors middleware
- **Development**: Nodemon

## 📁 Project Structure

```
VaraLagbe-backend/
├── src/
│   ├── models/              # Database schemas
│   │   └── User.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── controllers/         # Route controllers/handlers
│   │   └── authController.js
│   ├── middleware/          # Custom middleware
│   │   └── authMiddleware.js
│   ├── config/              # Configuration files
│   │   └── database.js
│   ├── validators/          # Input validation logic
│   │   └── validators.js
│   └── utils/               # Utility functions
│       └── errorHandler.js
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── server.js                # Application entry point
├── package.json             # Project dependencies
└── README.md                # This file
```

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Setup Steps

1. **Clone or navigate to the project**:

   ```bash
   cd VaraLagbe-backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create environment file**:

   ```bash
   cp .env.example .env
   ```

4. **Configure your environment variables** (see Configuration section below)

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/varalagbe

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:19000,http://localhost:8081
```

### Environment Variables Explained:

- **PORT**: Server port (default: 5000)
- **NODE_ENV**: Development/Production environment
- **MONGODB_URI**: MongoDB connection string
- **JWT_SECRET**: Secret key for JWT tokens (use a strong string)
- **JWT_EXPIRE**: Token expiration time
- **CORS_ORIGIN**: Allowed origins for CORS (comma-separated)

## 🏃 Running the Server

### Development Mode (with auto-reload):

```bash
npm run dev
```

### Production Mode:

```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT)

### Health Check:

```bash
curl http://localhost:5000/api/health
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User

- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: User data + JWT token

#### Login User

- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: User data + JWT token

#### Get Current User

- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Current user data

#### Logout

- **GET** `/api/auth/logout`
- **Response**: Logout confirmation

### User Routes (`/api/users`)

#### Get All Users (Admin Only)

- **GET** `/api/users`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: List of all users

#### Get User by ID

- **GET** `/api/users/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User data

#### Update User Profile

- **PUT** `/api/users/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Updated Name",
    "phone": "1234567890",
    "bio": "User bio",
    "avatar": "avatar_url"
  }
  ```
- **Response**: Updated user data

#### Delete User (Admin Only)

- **DELETE** `/api/users/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Deletion confirmation

## 💾 Database Models

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  avatar: String,
  bio: String,
  isVerified: Boolean (default: false),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🔒 Authentication

### JWT Implementation

The API uses JWT (JSON Web Tokens) for authentication:

1. User logs in/registers → receives a JWT token
2. Client includes token in request headers: `Authorization: Bearer <token>`
3. Server validates token on protected routes
4. Token expires after configured time (default: 7 days)

### Protected Routes

Routes that require authentication use the `protect` middleware:

- All `/api/auth/me` endpoint
- All `/api/users` endpoints (with role-based restrictions)

## 🔑 Middleware

### authMiddleware.js

- **protect**: Validates JWT token and attaches user to request
- **authorize**: Checks user role for route access

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **cors**: Cross-Origin Resource Sharing
- **body-parser**: Request body parsing
- **dotenv**: Environment configuration
- **nodemon**: Development auto-reload

## 🐛 Error Handling

The API includes centralized error handling:

- Custom error messages
- Proper HTTP status codes
- Validation error responses
- 404 handler for undefined routes

## 📝 Tips for Development

1. Always validate user input before processing
2. Use meaningful error messages
3. Keep sensitive data in .env file
4. Test API endpoints with Postman or similar tools
5. Use JWT tokens with Bearer prefix in Authorization header
6. Check MongoDB connection before making requests

## 🔄 Next Steps

To extend this API:

1. **Add more models**: Create additional MongoDB models for your features
2. **Add controllers**: Create controllers for business logic
3. **Add routes**: Define new API endpoints
4. **Add validation**: Use validators for input sanitization
5. **Add tests**: Implement unit and integration tests
6. **Add logging**: Implement logging for debugging

## 📞 Support

For issues or questions, check the logs in the console output or review the MongoDB connection settings.

---

**Created**: 2026
**Version**: 1.0.0
**License**: ISC
