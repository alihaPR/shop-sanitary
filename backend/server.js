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

        // آمار وضعیت سفارش‌ها
        const statusStats = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // آمار محصولات بر اساس دسته‌بندی
        const categoryStats = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // سفارش‌های ۷ روز اخیر
        const weeklyOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        

        res.json({
            productCount,
            userCount,
            orderCount,
            statusStats,
            categoryStats,
            weeklyOrders
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