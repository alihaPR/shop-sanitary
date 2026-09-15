const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const { protect, admin } = require("./middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
dotenv.config()
connectDB()

// ===========================
//  تبدیل تقویم میلادی <-> جلالی (بدون نیاز به پکیج جدید)
//  الگوریتم استاندارد جلالی (بر پایه کارهای Kazimierz Borkowski)
// ===========================
const PERSIAN_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

function jDiv(a, b) { return ~~(a / b); }
function jMod(a, b) { return a - ~~(a / b) * b; }

const JALAALI_BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

function jalCal(jy) {
    const bl = JALAALI_BREAKS.length;
    const gy = jy + 621;
    let leapJ = -14;
    let jp = JALAALI_BREAKS[0];
    if (jy < jp || jy >= JALAALI_BREAKS[bl - 1]) throw new Error("Invalid Jalaali year " + jy);
    let jump = 0;
    let jm;
    for (let i = 1; i < bl; i += 1) {
        jm = JALAALI_BREAKS[i];
        jump = jm - jp;
        if (jy < jm) break;
        leapJ = leapJ + jDiv(jump, 33) * 8 + jDiv(jMod(jump, 33), 4);
        jp = jm;
    }
    let n = jy - jp;
    leapJ = leapJ + jDiv(n, 33) * 8 + jDiv(jMod(n, 33) + 3, 4);
    if (jMod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    const leapG = jDiv(gy, 4) - jDiv((jDiv(gy, 100) + 1) * 3, 4) - 150;
    const march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + jDiv(jump + 4, 33) * 33;
    let leap = jMod(jMod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return { leap, gy, march };
}

function g2d(gy, gm, gd) {
    let d = jDiv((gy + jDiv(gm - 8, 6) + 100100) * 1461, 4)
        + jDiv(153 * jMod(gm + 9, 12) + 2, 5)
        + gd - 34840408;
    d = d - jDiv(jDiv(gy + 100100 + jDiv(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
}

function d2g(jdn) {
    let j = 4 * jdn + 139361631;
    j = j + jDiv(jDiv(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = jDiv(jMod(j, 1461), 4) * 5 + 308;
    const gd = jDiv(jMod(i, 153), 5) + 1;
    const gm = jMod(jDiv(i, 153), 12) + 1;
    const gy = jDiv(j, 1461) - 100100 + jDiv(8 - gm, 6);
    return { gy, gm, gd };
}

function j2d(jy, jm, jd) {
    const r = jalCal(jy);
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - jDiv(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn) {
    const gy = d2g(jdn).gy;
    let jy = gy - 621;
    const r = jalCal(jy);
    const jdn1f = g2d(gy, 3, r.march);
    let jd, jm, k;
    k = jdn - jdn1f;
    if (k >= 0) {
        if (k <= 185) {
            jm = 1 + jDiv(k, 31);
            jd = jMod(k, 31) + 1;
            return { jy, jm, jd };
        }
        k -= 186;
    } else {
        jy -= 1;
        k += 179;
        if (jalCal(jy).leap === 1) k += 1;
    }
    jm = 7 + jDiv(k, 30);
    jd = jMod(k, 30) + 1;
    return { jy, jm, jd };
}

function toJalaali(date) {
    const { year, month, day } = tehranNowParts(date);
    return d2j(g2d(year, month, day));
}

function jalaaliToGregorian(jy, jm, jd) {
    const g = d2g(j2d(jy, jm, jd));
    return new Date(Date.UTC(g.gy, g.gm - 1, g.gd, 0, 0, 0) - (3 * 60 + 30) * 60 * 1000);
}

// ===========================
//  کمک‌تابع‌های تایم‌زون ایران (UTC+03:30، بدون تغییر ساعت تابستانی)
//  چون MongoDB به‌طور پیش‌فرض $hour و $dateToString رو بر اساس UTC
//  حساب می‌کنه، و همچنین ممکنه سرور روی تایم‌زون دیگه‌ای اجرا بشه.
// ===========================
const TEHRAN_TZ = "Asia/Tehran";

function tehranDayStartUTC(date) {
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: TEHRAN_TZ,
        year: "numeric", month: "2-digit", day: "2-digit"
    });
    const parts = fmt.formatToParts(date).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
    const y = Number(parts.year), m = Number(parts.month), d = Number(parts.day);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - (3 * 60 + 30) * 60 * 1000);
}

function tehranNowParts(date) {
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: TEHRAN_TZ,
        year: "numeric", month: "2-digit", day: "2-digit"
    });
    const parts = fmt.formatToParts(date).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
    return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

const app = express()

app.use(cors())
app.use(express.json())
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const types = /jpeg|jpg|png|webp/;

        const ext = types.test(
            path.extname(file.originalname).toLowerCase()
        );

        const mime = types.test(file.mimetype);

        if (ext && mime) {

            cb(null, true);

        } else {

            cb(new Error("Only image files are allowed"));

        }

    }
});

// routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))
app.use('/api/payment', require('./routes/payment'))
app.use("/uploads", express.static("uploads"));

app.post("/api/upload", protect, upload.single("image"), (req, res) => {

    if (!req.file) {

        return res.status(400).json({
            message: "No file uploaded"
        });

    }

    res.json({
        image: `/uploads/${req.file.filename}`
    });

});
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
// نکته: قبلاً این مسیر دو بار تعریف شده بود. در Express فقط اولین
// handler برای یک مسیر تکراری اجرا می‌شود، بنابراین محاسبهٔ درآمد
// (که در نسخهٔ دوم بود) هیچ‌وقت واقعاً اجرا نمی‌شد. اینجا هر دو در
// یک مسیر واحد و صحیح ادغام شده‌اند.
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

        // سفارش‌های ۷ روز اخیر (برای نمودار گزارش سفارش هفتگی)
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
                            date: "$createdAt",
                            timezone: TEHRAN_TZ
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

        // مجموع کل درآمد
        const revenueTotal = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" }
                }
            }
        ]);

        // درآمد ماه جاری (بر اساس تقویم جلالی، برای هماهنگی با نمودار درآمد)
        const now = new Date();
        const todayJalaali = toJalaali(now);
        const currentJalaaliYear = todayJalaali.jy;
        const currentJalaaliMonth = todayJalaali.jm;

        const prevJm = currentJalaaliMonth === 1 ? 12 : currentJalaaliMonth - 1;
        const prevJy = currentJalaaliMonth === 1 ? currentJalaaliYear - 1 : currentJalaaliYear;
        const nextJm = currentJalaaliMonth === 12 ? 1 : currentJalaaliMonth + 1;
        const nextJy = currentJalaaliMonth === 12 ? currentJalaaliYear + 1 : currentJalaaliYear;

        const startOfThisMonth = jalaaliToGregorian(currentJalaaliYear, currentJalaaliMonth, 1);
        const startOfNextMonth = jalaaliToGregorian(nextJy, nextJm, 1);
        const startOfLastMonth = jalaaliToGregorian(prevJy, prevJm, 1);

        const revenueThisMonthAgg = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfThisMonth, $lt: startOfNextMonth } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const revenueLastMonthAgg = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        // روند درآمد ۱۲ ماه سال جلالی جاری (برای نمودار درآمد) — همه ماه‌ها حتی بدون فروش
        const startOfJalaaliYear = jalaaliToGregorian(currentJalaaliYear, 1, 1);
        const startOfNextJalaaliYear = jalaaliToGregorian(currentJalaaliYear + 1, 1, 1);

        const ordersThisJalaaliYear = await Order.find({
            createdAt: { $gte: startOfJalaaliYear, $lt: startOfNextJalaaliYear }
        }).select("totalPrice createdAt").lean();

        const revenueByJalaaliMonth = Array(12).fill(0);
        const ordersByJalaaliMonth = Array(12).fill(0);
        ordersThisJalaaliYear.forEach(order => {
            const { jm } = toJalaali(new Date(order.createdAt));
            revenueByJalaaliMonth[jm - 1] += order.totalPrice || 0;
            ordersByJalaaliMonth[jm - 1] += 1;
        });

        const monthlyRevenue = PERSIAN_MONTHS.map((label, idx) => ({
            month: idx + 1,
            label,
            total: revenueByJalaaliMonth[idx],
            count: ordersByJalaaliMonth[idx]
        }));

        const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
        const revenueLastMonth = revenueLastMonthAgg[0]?.total || 0;
        const revenueChangePercent = revenueLastMonth > 0
            ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
            : (revenueThisMonth > 0 ? 100 : 0);


        // سفارش‌های امروز
        const startOfToday = tehranDayStartUTC(now);

        const ordersToday = await Order.countDocuments({
            createdAt: { $gte: startOfToday }
        });

        const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

        const ordersYesterday = await Order.countDocuments({
            createdAt: { $gte: startOfYesterday, $lt: startOfToday }
        });

        // درآمد بر اساس ساعت‌های امروز (برای تب «امروز»)
        const revenueHourly = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfToday } } },
            {
                $group: {
                    _id: { $hour: { date: "$createdAt", timezone: TEHRAN_TZ } },
                    total: { $sum: "$totalPrice" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // درآمد ۷ روز اخیر به تفکیک روز (برای تب «هفته»)
        const revenueDaily = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TEHRAN_TZ } },
                    total: { $sum: "$totalPrice" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // ۵ سفارش اخیر (برای جدول سفارشات اخیر)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name")
            .select("totalPrice status createdAt user")
            .lean();

        // محصولات کم‌موجود / ناموجود (آستانه: ۵ عدد)
        const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
            .sort({ stock: 1 })
            .limit(5)
            .select("name image stock")
            .lean();

        res.json({
            productCount,
            userCount,
            orderCount,
            ordersToday,
            ordersYesterday,
            ordersTodayChangePercent: ordersYesterday > 0
                ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100)
                : (ordersToday > 0 ? 100 : 0),
            statusStats,
            categoryStats,
            weeklyOrders,
            revenue: revenueTotal[0]?.totalRevenue || 0,
            revenueThisMonth,
            revenueLastMonth,
            revenueChangePercent,
            monthlyRevenue,
            revenueDaily,
            revenueHourly,
            recentOrders,
            lowStockProducts
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});