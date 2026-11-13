const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const axios = require("axios");
const { resolveShippingAddress } = require("../utils/addressHelper");

// const Product = require("../models/Product");
// const mongoose = require("mongoose");
// const axios = require("axios");
// const Order = require("../models/Order");

const API = process.env.ZARINPAL_SANDBOX === "true"
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://api.zarinpal.com/pg/v4/payment";

const START_PAY = process.env.ZARINPAL_SANDBOX === "true"
  ? "https://sandbox.zarinpal.com/pg/StartPay/"
  : "https://www.zarinpal.com/pg/StartPay/";

// قیمت‌های سایت به «تومان» است ولی زرین‌پال مبلغ را به «ریال» می‌گیرد
const TOMAN_TO_RIAL = 10;

// مهلت پرداخت در درگاه؛ بعد از آن سفارش لغو و موجودی برمی‌گردد
const GATEWAY_PAY_MINUTES = Number(process.env.GATEWAY_PAY_MINUTES) || 30;

// مبلغ قابل پرداخت (تومان) = قیمت کالاها + هزینه ارسال
const payableToman = (order) =>
  (order.totalPrice || 0) + (order.shippingCost || 0);

// خطایی که پیامش برای مشتری قابل نمایش است (مثلاً کمبود موجودی)
const userError = (msg) => Object.assign(new Error(msg), { status: 400 });

// BACKEND_URL چه با /api تمام شود چه نشود، آدرس callback درست ساخته می‌شود
const verifyCallbackUrl = () =>
  String(process.env.BACKEND_URL || "")
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "") + "/api/payment/verify";

exports.createPayment = async (req, res) => {
  // بدون تراکنش MongoDB (روی دیتابیس تکی/بدون replica set کار نمی‌کند):
  // موجودی با عملیات اتمیک کم می‌شود و در صورت هر خطا برگردانده می‌شود.
  let reserved = [];
  let order = null;

  try {

    const { items } = req.body || {};

    // اگر addressId ارسال شده باشد، مالکیت بررسی و Snapshot آدرس از دیتابیس ساخته می‌شود
    const resolvedAddress = await resolveShippingAddress(req);
    const shippingAddress = resolvedAddress || (req.body || {}).shippingAddress;

    if (!shippingAddress) {
      return res.status(400).json({
        message: "آدرس ارسال سفارش را انتخاب کنید."
      });
    }

    // ---------- اعتبارسنجی ورودی (قبل از شروع تراکنش) ----------
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "سبد خرید خالی است."
      });
    }

    if (items.length > 50) {
      return res.status(400).json({
        message: "تعداد اقلام سبد خرید بیش از حد مجاز است."
      });
    }

    for (const item of items) {

      if (!item || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          message: "شناسه محصول نامعتبر است."
        });
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({
          message: "تعداد محصول نامعتبر است."
        });
      }

    }

    let orderItems = [];
    let totalPrice = 0;

    for (const item of items) {

      const product = await Product.findById(item.product);

      if (!product) {
        throw userError("محصول پیدا نشد.");
      }

      if (!product.available) {
        throw userError(`${product.name} موجود نیست.`);
      }

      // کم کردن اتمیک موجودی: فقط اگر موجودی کافی باشد
      const updated = await Product.findOneAndUpdate(
        { _id: product._id, available: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, buyers: item.quantity } },
        { new: true }
      );

      if (!updated) {
        throw userError(`موجودی ${product.name} کافی نیست.`);
      }

      reserved.push({ id: product._id, qty: item.quantity });

      const finalPrice =
        product.discountPercent > 0
          ? Math.round(product.price * (1 - product.discountPercent / 100))
          : product.price;

      totalPrice += finalPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: finalPrice,
        qty: item.quantity
      });

    }

    const shippingCost =
      totalPrice >= 500000 ? 0 : 35000;

    // کالاها + ارسال (تومان)
    const payable = totalPrice + shippingCost;

    order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalPrice,
      shippingCost,
      paymentMethod: "gateway",
      status: "pending",
      paymentExpiresAt: new Date(Date.now() + GATEWAY_PAY_MINUTES * 60 * 1000)
    });

    const response = await axios.post(
      `${API}/request.json`,
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,

        amount: payable * TOMAN_TO_RIAL,

        callback_url:
          `${verifyCallbackUrl()}?orderId=${order._id}`,

        description: `Order ${order._id}`
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.data.code !== 100) {

      throw new Error(response.data.data.message);

    }

    // شماره Authority به سفارش گره می‌خورد تا در verify قابل بررسی باشد
    order.authority = response.data.data.authority;
    await order.save();

    res.json({
      authority: response.data.data.authority,
      paymentUrl:
        START_PAY + response.data.data.authority
    });

  }

  catch (err) {

    // سفارشی که به درگاه نرسیده حذف می‌شود و موجودی رزروشده برمی‌گردد
    if (order) {
      try {
        await Order.deleteOne({ _id: order._id, isPaid: false });
      } catch (e) {
        console.error("createPayment order cleanup error:", e.message);
      }
    }

    for (const r of reserved) {
      try {
        await Product.updateOne(
          { _id: r.id },
          { $inc: { stock: r.qty, buyers: -r.qty } }
        );
      } catch (e) {
        console.error("createPayment stock rollback error:", e.message);
      }
    }

    console.error(err);

    res.status(err.status || 500).json({
      message: err.status ? err.message : "خطا در ایجاد پرداخت."
    });

  }

};

// لغو سفارش پرداخت‌نشده و برگرداندن موجودی (به‌جای حذف سفارش)
// اتمیک است: فقط یک بار، و فقط برای سفارشِ هنوز pending و پرداخت‌نشده اجرا می‌شود
async function cancelOrder(order) {

  const locked = await Order.findOneAndUpdate(
    { _id: order._id, isPaid: false, status: "pending" },
    { $set: { status: "cancelled" } }
  );

  if (!locked) return;

  for (const item of order.items) {

    try {

      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.qty, buyers: -item.qty } }
      );

    } catch (e) {

      console.error("cancelOrder stock restore error:", e.message);

    }

  }

}

exports.verifyPayment = async (req, res) => {

  const failedUrl = `${process.env.SITE_URL}/payment-failed.html`;

  // سفارشی که ارتباط‌مان با زرین‌پال حین بررسی‌اش قطع شده (برای بررسی دستی)
  let reviewOrderId = null;

  try {

    const { Authority, Status, orderId } = req.query;

    if (
      typeof Authority !== "string" ||
      typeof orderId !== "string" ||
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      return res.redirect(failedUrl);
    }

    const order = await Order.findById(orderId);

    // Authority باید دقیقاً همان باشد که موقع ساخت پرداخت روی این سفارش ثبت شده
    // (در غیر این‌صورت هیچ تغییری روی سفارش داده نمی‌شود)
    if (
      !order ||
      order.paymentMethod !== "gateway" ||
      !order.authority ||
      order.authority !== Authority
    ) {
      return res.redirect(failedUrl);
    }

    reviewOrderId = order._id;

    // سفارش قبلاً پرداخت شده؛ دوباره پردازش نمی‌شود
    if (order.isPaid) {
      return res.redirect(
        `${process.env.SITE_URL}/payment-success.html?refId=${encodeURIComponent(order.refId || "")}&orderId=${order._id}`
      );
    }

    if (order.status !== "pending") {
      return res.redirect(failedUrl);
    }

    if (Status !== "OK") {

      await cancelOrder(order);

      return res.redirect(failedUrl);

    }

    const response = await axios.post(
      `${API}/verify.json`,
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: payableToman(order) * TOMAN_TO_RIAL,
        authority: Authority
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const result = response.data.data;

    if (
      result.code === 100 ||
      result.code === 101
    ) {

      // علامت‌گذاری اتمیک: اگر دو callback هم‌زمان برسند، فقط یکی اعمال می‌شود
      const paid = await Order.findOneAndUpdate(
        { _id: order._id, isPaid: false, status: "pending" },
        {
          $set: {
            isPaid: true,
            status: "processing",
            paidAt: new Date(),
            refId: String(result.ref_id)
          }
        },
        { new: true }
      );

      const current = paid || await Order.findById(order._id);

      if (current && current.isPaid) {

        return res.redirect(
          `${process.env.SITE_URL}/payment-success.html?refId=${encodeURIComponent(current.refId || result.ref_id)}&orderId=${current._id}`
        );

      }

    }

    return res.redirect(failedUrl);

  } catch (err) {

    // عمداً سفارش لغو/حذف نمی‌شود: ممکن است پول کسر شده باشد و فقط ارتباط با زرین‌پال قطع شده باشد.
    // سفارش pending می‌ماند تا بررسی دستی شود (مهلت انقضا برداشته می‌شود تا job خودکار لغوش نکند).
    console.error(err.response?.data || err.message);

    if (reviewOrderId) {
      try {
        await Order.updateOne(
          { _id: reviewOrderId, isPaid: false, status: "pending" },
          { $unset: { paymentExpiresAt: 1 } }
        );
      } catch (_) { /* مهم نیست */ }
    }

    return res.redirect(failedUrl);

  }

};

// ============================================================
//  لغو خودکار سفارش‌های درگاهِ رهاشده (مشتری از صفحه‌ی بانک برنگشته)
//  مهلت: GATEWAY_PAY_MINUTES دقیقه. موجودی با cancelOrder برمی‌گردد.
//  سفارش‌هایی که paymentExpiresAt ندارند (مثلاً در انتظار بررسی دستی) لمس نمی‌شوند.
// ============================================================
async function expireGatewayOrders() {

  try {

    const orders = await Order.find({
      paymentMethod: "gateway",
      status: "pending",
      isPaid: false,
      paymentExpiresAt: { $lt: new Date() }
    }).limit(100);

    for (const order of orders) {
      await cancelOrder(order);
    }

  } catch (err) {

    console.error("expireGatewayOrders error:", err.message);

  }

}

setInterval(expireGatewayOrders, 60 * 1000);