const util = require('util')
const createMessage = require('./create-message')

const publishQualityCheckRequest = async (paymentRequest, qualityCheckSender) => {
  const message = createMessage(paymentRequest, 'uk.gov.pay.quality.check')
  await qualityCheckSender.sendMessage(message)

  console.log('Completed request sent:', util.inspect(message, false, null, true))
}

module.exports = publishQualityCheckRequest
