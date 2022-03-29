const { PublishEvent } = require('ffc-pay-event-publisher')
const config = require('./config')

const raiseEvent = async (event, status = 'success', error = '') => {
  const eventPublisher = new PublishEvent(config.eventTopic)

  const eventMessage = {
    name: event.name,
    properties: {
      id: event.id,
      checkpoint: process.env.APPINSIGHTS_CLOUDROLE,
      status,
      action: {
        type: event.type,
        message: event.message,
        data: event.data
      }
    }
  }

  await eventPublisher.sendEvent(eventMessage)
}

module.exports = raiseEvent
