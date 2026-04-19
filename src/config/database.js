const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/varalagbe';

        const connection = await mongoose.connect(mongoURI);
        console.log(`✓ MongoDB connected successfully: ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.error(`✗ Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
