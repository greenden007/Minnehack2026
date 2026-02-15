const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const User = require('../models/userSchema');
const Info = require('../models/infoSchema');

router.patch('/updateNumbers', auth, async (req, res) => {
    try {
        const { emergencyContactNums } = req.body;

        if (!Array.isArray(emergencyContactNums)) {
            return res.status(400).json({ message: 'Emergency contact numbers must be an array' });
        }

        await User.updateOne({ _id: req.user.id }, { emergencyContactNums });

        res.status(200).json({ message: 'Emergency contact numbers updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

router.get('/getNumbers', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ emergencyContactNums: user.emergencyContactNums });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

router.get('/getInfo', auth, async (req, res) => {
    try {
        const info = await Info.findOne({ userId: req.user.id });
        res.status(200).json(info);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

router.patch('/updateInfo', auth, async (req, res) => {
    try {
        const { issueSummarization, fullInfo, doctorApproved, forms } = req.body;
        const info = await Info.findOneAndUpdate({ userId: req.user.id }, { issueSummarization, fullInfo, doctorApproved, forms }, { new: true });
        res.status(200).json(info);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

module.exports = router;
