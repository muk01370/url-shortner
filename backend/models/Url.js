const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                try {
                    new URL(v);
                    return true;
                } catch {
                    return false;
                }
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    shortCode: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 10
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visits: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    qrCode: {
        type: String
    }
});

// Index for shortCode to improve lookup performance
UrlSchema.index({ shortCode: 1 });

module.exports = mongoose.model('Url', UrlSchema);
