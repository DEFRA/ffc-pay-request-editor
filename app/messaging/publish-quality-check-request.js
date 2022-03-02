const util = require('util')
const createMessage = require('./create-message')

const publishQualityCheckRequest = async (request, qualityCheckSender) => {
  const message = createMessage(request, 'uk.gov.pay.quality.check')
  const m = await qualityCheckSender.sendMessage(message) // breaks here
  console.log('Completed request sent:', util.inspect(m, false, null, true))
}

module.exports = publishQualityCheckRequest
