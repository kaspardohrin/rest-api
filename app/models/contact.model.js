const mongoose = require('mongoose');

const ContactSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: String,
}, {
    timestamps: false,
});

module.exports = mongoose.model('Contact', ContactSchema);