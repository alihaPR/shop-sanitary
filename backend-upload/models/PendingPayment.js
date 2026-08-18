const mongoose = require("mongoose");

const pendingPaymentSchema = new mongoose.Schema({

    authority: {
        type: String,
        required: true,
        unique: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },

            quantity: {
                type: Number,
                required: true
            }
        }
    ],

    shippingAddress: {

        province: String,

        city: String,

        address: String,

        plaque: String,

        unit: String,

        postalCode: String

    },

    amount: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1800 // حذف خودکار بعد از ۳۰ دقیقه
    }

});

module.exports = mongoose.model(
    "PendingPayment",
    pendingPaymentSchema
);