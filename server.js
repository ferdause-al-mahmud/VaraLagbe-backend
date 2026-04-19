require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:19000',
        'http://localhost:8081'
    ] || '*',
    credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/varalagbe');
        console.log('✓ MongoDB connected successfully');
    } catch (error) {
        console.error('✗ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

connectDB();

// Routes


// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
