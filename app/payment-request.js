const enrichData = require('./routes/enrich-data')
const db = require('./data')

const getPaymentRequest = async () => {
  const paymentRequest = await db.paymentRequest.findAll()
  console.log(paymentRequest)
  return enrichData
}

module.exports = {
  getPaymentRequest
}
