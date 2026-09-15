require("dotenv").config();

const connectDB = require("./config/db");
const Product = require("./models/Product");

// مسیر فایل محصولات
const products = require("../frontend/js/products-data");

const seedDatabase = async () => {
    try {
        await connectDB();

        await Product.deleteMany();

        await Product.insertMany(products);

        console.log("✅ Products Imported Successfully");

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDatabase();