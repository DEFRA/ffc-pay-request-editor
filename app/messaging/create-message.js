const createMessage = (body, type, options) => {
  return {
    body,
    type,
    source: 'ffc-pay-request-editor',
    ...options
  }
}

module.exports = createMessage
