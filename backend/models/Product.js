const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: ""
},

specifications: [
    {
        title: {
            type: String
        },
        value: {
            type: String
        }
    }
],
  price: {
    type: Number,
    required: true
  },
  discountPercent: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['پوشک-کودک', 'پوشک-بزرگسال', 'نوار-بهداشتی', 'پنبه', 'دستمال-مرطوب']
  },
  available: {
    type: Boolean,
    default: true
  },
  buyers: {
    type: Number,
    default: 0
  },
  warranty: {
    type: String,
    default: ''
  },
  features: [{
    type: String
  }],
  specs: [{
    label: String,
    value: String
  }]
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)