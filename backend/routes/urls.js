const express = require('express');
const shortid = require('shortid');
const Url = require('../models/Url');
const auth = require('../middleware/auth');
const router = express.Router();

// Shorten URL
router.post('/shorten', auth, async (req, res) => {
    const { originalUrl } = req.body;
    if (!originalUrl || !isValidUrl(originalUrl)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        const shortId = shortid.generate();
        const url = new Url({
            originalUrl,
            shortId,
            userId: req.user.id
        });
        await url.save();
        res.json({ shortUrl: `${process.env.BASE_URL}/${shortId}`, shortId, originalUrl });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's URLs
router.get('/', auth, async (req, res) => {
    try {
        const urls = await Url.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(urls);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get click statistics for dashboard
router.get('/stats', auth, async (req, res) => {
    try {
        const urls = await Url.find({ userId: req.user.id }).select('shortId originalUrl clicks createdAt');
        const clickStats = urls.reduce((acc, url) => {
            const date = new Date(url.createdAt).toISOString().split('T')[0];
            if (!acc[date]) acc[date] = 0;
            acc[date] += url.clicks;
            return acc;
        }, {});

        const stats = Object.entries(clickStats).map(([date, clicks]) => ({
            date,
            clicks
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({ urls, stats });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete URL
router.delete('/:shortId', auth, async (req, res) => {
    const { shortId } = req.params;
    try {
        const url = await Url.findOne({ shortId, userId: req.user.id });
        if (!url) {
            return res.status(404).json({ error: 'URL not found or unauthorized' });
        }
        await url.deleteOne();
        res.json({ message: 'URL deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

module.exports = router;