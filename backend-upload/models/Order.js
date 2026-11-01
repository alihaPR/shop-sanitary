const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },

      name: {
        type: String,
        required: true
      },

      image: {
        type: String,
        required: true
      },

      price: {
        type: Number,
        required: true
      },

      qty: {
        type: Number,
        required: true
      }
    }
  ],

  shippingAddress: {

    province: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    plaque: {
      type: String,
      required: true
    },

    unit: {
      type: String,
      default: ""
    },

    postalCode: {
      type: String,
      required: true
    }

  },

  totalPrice: {
    type: Number,
    required: true
  },

  shippingCost: {
    type: Number,
    default: 35000
  },

  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ],
    default: 'pending'
  },

  isPaid: {
    type: Boolean,
    default: false
  },

  paidAt: {
    type: Date
  },

  // ---------- پرداخت کارت‌به‌کارت ----------
  paymentMethod: {
    type: String,
    enum: ['gateway', 'card'],
    default: 'gateway'
  },

  paymentStatus: {
    type: String,
    enum: ['unpaid', 'receipt_submitted', 'paid', 'rejected', 'expired'],
    default: 'unpaid'
  },

  receiptImage: {
    type: String
  },

  receiptSubmittedAt: {
    type: Date
  },

  paymentExpiresAt: {
    type: Date
  },

  adminNote: {
    type: String,
    default: ""
  }

}, {
  timestamps: true
})

module.exports = mongoose.model('Order', orderSchema)