const axios = require("axios");
const Order = require("../models/Order");

const API = process.env.ZARINPAL_SANDBOX === "true"
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://api.zarinpal.com/pg/v4/payment";

const START_PAY = process.env.ZARINPAL_SANDBOX === "true"
  ? "https://sandbox.zarinpal.com/pg/StartPay/"
  : "https://www.zarinpal.com/pg/StartPay/";

exports.createPayment = async (req, res) => {

  try {

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "سفارش پیدا نشد."
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        message: "این سفارش قبلاً پرداخت شده است."
      });
    }

    const response = await axios.post(
      `${API}/request.json`,
      {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,

        amount: order.totalPrice,

        callback_url: `${process.env.SITE_URL}/payment/verify?orderId=${order._id}`,

        description: `Order ${order._id}`
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.data.code !== 100) {

      return res.status(400).json({
        message: response.data.data.message
      });

    }

    res.json({

      authority: response.data.data.authority,

      paymentUrl:
        START_PAY + response.data.data.authority

    });

  } catch (err) {

    console.error(err.response?.data || err);

    res.status(500).json({

      message: "خطا در ایجاد پرداخت."

    });

  }

};

exports.verifyPayment = async (req, res) => {

  try {

    const { Authority, Status, orderId } = req.query;

    if (Status !== "OK") {

      return res.redirect(
        "/payment-failed.html"
      );

    }

    const order = await Order.findById(orderId);

    if (!order) {

      return res.redirect(
        "/payment-failed.html"
      );

    }

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
        `/payment-success.html?refId=${result.ref_id}`
      );

    }

    return res.redirect(
      "/payment-failed.html"
    );

  } catch (err) {

    console.error(err.response?.data || err);

    return res.redirect(
      "/payment-failed.html"
    );

  }

};