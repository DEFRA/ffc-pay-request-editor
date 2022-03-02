const publishQualityCheckRequest = require('./publish-quality-check-request')
const { getCompletedQualityCheckRequests } = require('../quality-check')

const processQualityCheckRequests = async (qualityCheckSender) => {
  try {
    const notNullReleased = await getCompletedQualityCheckRequests()
    for (const request of notNullReleased) {
      await publishQualityCheckRequest(request, qualityCheckSender)
    }
  } catch (err) {
    console.error('Unable to process quality check message:', err)
  }
}

module.exports = processQualityCheckRequests
