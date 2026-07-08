const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const { protect, admin } = require("./middleware/auth");
dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())

// routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))
app.use('/api/contact', require('./routes/contactRoutes'))
app.use('/api/users', require('./routes/userRoutes'))

app.get('/', (req, res) => {
  res.send('NSG API is running...')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})




// ===============dashbord rout=============
app.get("/api/admin/stats", protect, admin, async (req, res) => {

    try {

        const productCount = await Product.countDocuments();

        const userCount = await User.countDocuments();

        const orderCount = await Order.countDocuments();

        res.json({
            productCount,
            userCount,
            orderCount
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});
// =====================================rout order==================
app.get("/api/admin/stats", protect, admin, async (req, res) => {

    try {

        const productCount = await Product.countDocuments();

        const userCount = await User.countDocuments();

        const orderCount = await Order.countDocuments();

        res.json({
            productCount,
            userCount,
            orderCount
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});