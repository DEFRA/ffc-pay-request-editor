const db = require('../data')

const createSchedule = async (scheduleId, paymentRequestId) => {
  await db.schedule.create({ scheduleId, paymentRequestId })
}

module.exports = createSchedule
