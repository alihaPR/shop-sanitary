const express = require("express");
const router = express.Router();

const {
  createPayment,
  verifyPayment
} = require("../controllers/paymentController");

const { protect } = require("../middleware/auth");

// ایجاد پرداخت
router.post(
  "/create",
  protect,
  createPayment
);

// Callback زرین پال
router.get(
  "/verify",
  verifyPayment
);

module.exports = router;