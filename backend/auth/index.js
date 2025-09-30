require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

let usersCollection;

// User Registration Route
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    try {
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).send({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Encrypt the password

        const newUser = {
            email,
            password: hashedPassword
        };

        await usersCollection.insertOne(newUser);

        res.status(201).send({ message: "User registered successfully!" });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send({ message: "Internal server error while registering user." });
    }
});

// User Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    try {
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: "Incorrect password." });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).send({ token });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send({ message: "Internal server error during login." });
    }
});

app.listen(8001, async () => {
    console.log("Authentication server is running on port 8001");
    // console.log(`[DEBUG] Attempting to connect to MongoDB host: '${process.env.MONGO_HOST}'`);

    try {
        const encodedPassword = encodeURIComponent(process.env.MONGO_PASSWORD);
        const mongoUrl = `mongodb://${process.env.MONGO_USER}:${encodedPassword}@${process.env.MONGO_HOST}:27017`;
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(process.env.MONGO_DB_NAME);
        usersCollection = db.collection('users');
        console.log('Connected to MongoDB (Auth).');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
});