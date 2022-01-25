const processDebtDataMessage = async (message, receiver) => {
  try {
    console.log('Debt data message received')
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process debt data message:', err)
    await receiver.abandonMessage(message)
  }
}

module.exports = processDebtDataMessage
