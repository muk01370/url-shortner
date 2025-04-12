const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Url = require('../models/Url');
const router = express.Router();
const validUrl = require('valid-url');
const shortid = require('shortid');
const qr = require('qrcode');

// =====================
// JWT Middleware
// =====================
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// =====================
// Route: Check Code Availability
// =====================
router.get('/check-availability/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const valid = /^[a-zA-Z0-9_-]{3,20}$/.test(code);
        if (!valid) {
            return res.json({ available: false, msg: 'Invalid code format' });
        }

        const existingUrl = await Url.findOne({ shortCode: code });
        return res.json({ available: !existingUrl });
    } catch (err) {
        console.error('Availability Check Error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// =====================
// Route: Get User URLs
// =====================
router.get('/user/urls', auth, async (req, res) => {
    try {
        const urls = await Url.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(urls);
    } catch (err) {
        console.error('User URLs Fetch Error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// =====================
// Route: Shorten URL
// =====================
router.post('/shorten', auth, [
    body('originalUrl').isURL().withMessage('A valid URL is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { originalUrl, customCode } = req.body;

        if (!validUrl.isUri(originalUrl)) {
            return res.status(400).json({ msg: 'Invalid URL' });
        }

        // Check if URL already exists for user
        let url = await Url.findOne({ originalUrl, userId: req.user.id });
        if (url) return res.json(url);

        let shortCode;

        if (customCode) {
            const isValid = /^[a-zA-Z0-9_-]{3,20}$/.test(customCode);
            if (!isValid) {
                return res.status(400).json({ msg: 'Custom code must be 3-20 characters long and alphanumeric with _ or -' });
            }

            const existing = await Url.findOne({ shortCode: customCode });
            if (existing) {
                return res.status(400).json({ msg: 'Custom code is already taken' });
            }

            shortCode = customCode;
        } else {
            shortCode = shortid.generate();
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const qrCode = await qr.toDataURL(`${baseUrl}/${shortCode}`);

        url = new Url({
            originalUrl,
            shortCode,
            userId: req.user.id,
            qrCode
        });

        await url.save();
        res.json(url);
    } catch (err) {
        console.error('URL Shortening Error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// =====================
// Route: Redirect Short URL
// =====================
// NOTE: Place this at the end to avoid route conflict
router.get('/:shortCode', async (req, res) => {
    try {
        const url = await Url.findOneAndUpdate(
            { shortCode: req.params.shortCode },
            { $inc: { visits: 1 } },
            { new: true }
        );

        if (!url) {
            return res.status(404).json({ msg: 'URL not found' });
        }

        res.redirect(url.originalUrl);
    } catch (err) {
        console.error('Redirection Error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
