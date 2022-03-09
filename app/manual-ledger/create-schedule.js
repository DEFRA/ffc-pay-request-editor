const db = require('../data')

const createSchedule = async (scheduleId, paymentRequestId, transaction) => {
  await db.schedule.create({ scheduleId, paymentRequestId }, { transaction })
}

module.exports = createSchedule
