const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Load environment variables from config.env file
dotenv.config({ path: 'config.env' });

const app = express();

// Middleware for logging in development mode
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log(`mode: ${process.env.NODE_ENV}`);
}

// Route handling
app.get('/', (req, res) => {
    res.send('OUR API v3');
});

// Port configuration
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
    .then((conn) => {
        console.log(`Database connected: ${conn.connection.host}`);
    })
    .catch((err) => {
        console.error(`Database Error: ${err}`);
        process.exit(1); // Exit process with failure
    });


// Start the server
app.listen(PORT, () => {
    console.log(`App Running on port ${PORT}`);
});
