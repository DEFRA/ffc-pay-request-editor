const processQualityCheckMessage = async (message, receiver) => {
  try {
    console.log('Quality check message received')
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process standards request message:', err)
    await receiver.abandonMessage(message)
  }
}

module.exports = processQualityCheckMessage
