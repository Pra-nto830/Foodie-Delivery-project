const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    items: Array,
    total: Number,
    paymentMethod: String,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }
});
module.exports = mongoose.model('Order', orderSchema);