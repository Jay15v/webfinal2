const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');

// Load environment variables from config.env file
dotenv.config({ path: 'config.env' });

const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for handling JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON');
        return res.status(400).send({ status: 400, message: 'Bad JSON format' });
    }
    next();
});

// Middleware for logging in development mode
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log(`Mode: ${process.env.NODE_ENV}`);
}

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('Database connected');
    })
    .catch((err) => {
        console.error('Database Error:', err);
        process.exit(1); // Exit process with failure
    });

// Create Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

// Create Model
const UserModel = mongoose.model('User', userSchema);

// Route to create a new user
app.post("/", (req, res) => {
    const { username, email, password } = req.body;
    console.log('Request body:', req.body); // Log request body

    const newUser = new UserModel({ username, email, password });
    newUser.save()
        .then((doc) => {
            console.log('Document inserted:', doc); // Log inserted document
            res.json(doc);
        })
        .catch((err) => {
            console.error('Error inserting document:', err); // Log error
            if (err.code === 11000) {
                // Duplicate key error
                res.status(400).json({
                    status: 'error',
                    message: `Duplicate key error: ${JSON.stringify(err.keyValue)} already exists`
                });
            } else {
                res.status(400).json(err);
            }
        });
});

// Route handling
app.get('/', (req, res) => {
    res.send('OUR API v3');
});

// Port configuration
const PORT = process.env.PORT || 8000;

// Start the server
app.listen(PORT, () => {
    console.log(`App Running on port ${PORT}`);
});
