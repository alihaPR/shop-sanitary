// خطای ۵۰۰ عمومی به کاربر؛ جزئیات فقط در لاگ سرور
module.exports = function serverError(res, err) {
  console.error(err)
  return res.status(500).json({ message: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید.' })
}
