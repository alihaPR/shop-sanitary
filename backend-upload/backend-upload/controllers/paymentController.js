const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const axios = require("axios");

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

exports.createPayment = async (req, res) => {
  let session;

  try {

    session = await mongoose.startSession();
    session.startTransaction();

    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "سبد خرید خالی است."
      });
    }

    let orderItems = [];
    let totalPrice = 0;

    for (const item of items) {

      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new Error("محصول پیدا نشد.");
      }

      if (!product.available) {
        throw new Error(`${product.name} موجود نیست.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`موجودی ${product.name} کافی نیست.`);
      }

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

      product.stock -= item.quantity;
      product.buyers += item.quantity;

      await product.save({ session });

    }

    const shippingCost =
      totalPrice >= 500000 ? 0 : 35000;

    const [order] = await Order.create(
      [{
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        totalPrice,
        shippingCost,
        status: "pending"
      }],
      { session }
    );

    const response = await axios.post(
      `${API}/request.json`,
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,

        amount: totalPrice,

        callback_url:
          `${process.env.BACKEND_URL}/payment/verify?orderId=${order._id}`,

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

    await session.commitTransaction();

    session.endSession();

    res.json({
      authority: response.data.data.authority,
      paymentUrl:
        START_PAY + response.data.data.authority
    });

  }

  catch (err) {

    if (session) {

      await session.abortTransaction();

      session.endSession();

    }

    console.error(err);

    res.status(500).json({
      message: err.message || "خطا در ایجاد پرداخت."
    });

  }

};

async function rollbackOrder(order) {

  for (const item of order.items) {

    const product = await Product.findById(item.product);

    if (!product) continue;

    product.stock += item.qty;

    product.buyers = Math.max(0, product.buyers - item.qty);

    await product.save();

  }

  await Order.findByIdAndDelete(order._id);

}

exports.verifyPayment = async (req, res) => {
  console.log("VERIFY QUERY:", req.query);
  try {

    const { Authority, Status, orderId } = req.query;

    if (Status !== "OK") {

      const order = await Order.findById(orderId);

      if (order && !order.isPaid) {

        await rollbackOrder(order);

      }

      return res.redirect(
        `${process.env.SITE_URL}/payment-failed.html`
      );

    }

    const order = await Order.findById(orderId);

    if (!order) {

      return res.redirect(
        `${process.env.SITE_URL}/payment-failed.html`
      );

    }

    console.log("VERIFY REQUEST:", {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: order.totalPrice,
      authority: Authority
    });

    const response = await axios.post(
      `${API}/verify.json`,
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: order.totalPrice,
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

      order.isPaid = true;

      order.status = "processing";

      order.paidAt = new Date();

      await order.save();

      return res.redirect(
        `${process.env.SITE_URL}/payment-success.html?refId=${result.ref_id}&orderId=${order._id}`
      );

    }

    return res.redirect(
      `${process.env.SITE_URL}/payment-failed.html`
    );

  } catch (err) {

    console.error(err.response?.data || err);

    // اگر سفارش ساخته شده ولی پرداخت کامل نشده بود
    if (req.query.orderId) {

      const order = await Order.findById(req.query.orderId);

      if (order && !order.isPaid) {

        await rollbackOrder(order);

      }

    }

    return res.redirect(
      `${process.env.SITE_URL}/payment-failed.html`
    );

  }

};