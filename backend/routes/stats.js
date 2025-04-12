const express = require('express');
const jwt = require('jsonwebtoken');
const Url = require('../models/Url');
const router = express.Router();

// Middleware to verify JWT
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// @route   GET /api/stats/summary
// @desc    Get summary statistics for user
router.get('/summary', auth, async (req, res) => {
    try {
        const totalUrls = await Url.countDocuments({ userId: req.user.id });
        const totalVisits = await Url.aggregate([
            { $match: { userId: req.user.id } },
            { $group: { _id: null, total: { $sum: "$visits" } } }
        ]);
        
        const recentUrls = await Url.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalUrls,
            totalVisits: totalVisits[0]?.total || 0,
            recentUrls
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/stats/top
// @desc    Get top performing URLs
router.get('/top', auth, async (req, res) => {
    try {
        const topUrls = await Url.find({ userId: req.user.id })
            .sort({ visits: -1 })
            .limit(5);

        res.json(topUrls);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
