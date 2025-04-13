require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');

const app = express();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// Redirect shortened URL
app.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;
    try {
        const urlDoc = await require('./models/Url').findOne({ shortId });
        if (!urlDoc) return res.status(404).json({ error: 'URL not found' });
        urlDoc.clicks += 1;
        await urlDoc.save();
        res.redirect(urlDoc.originalUrl);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));