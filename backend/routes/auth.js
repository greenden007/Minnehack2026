const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/userSchema');
const Info = require('../models/infoSchema');

require('dotenv').config();

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, username, emergencyContactNums } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            emergencyContactNums
        });

        await user.save();
        const userId = user.id;

        let info = new Info({
            userId,
            issueSummarization: "",
            fullInfo: "",
            doctorApproved: false,
            forms: new Map()
        });

        await info.save();
        const payload = {
            user: {
                id: userId
            },
            info: {
                id: info.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const info = await Info.findOne({ userId: user.id });
        if (!info) {
            return res.status(400).json({ message: 'User info not found' });
        }

        const payload = {
            user: {
                id: user.id
            },
            info: {
                id: info.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '18h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

router.post('/logout', async (req, res) => {
    try {
        const { username } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ message: 'Logged out successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

module.exports = router;
