const format = require('../utils/date-formatter')
const dateSchema = require('../routes/schemas/date')

const validateDate = async (payload, received) => {
  const day = format(payload.day)
  const month = format(payload.month)
  const year = payload.year

  const validDate = dateSchema({
    date: `${year}-${month}-${day}`
  }, received)

  if (validDate.error) {
    return validDate.error
  }

  if (payload?.day === '29' && payload?.month === '02') {
    const isLeap = new Date(payload?.year, 1, 29).getDate() === 29
    if (!isLeap) {
      return {
        details: [{
          context: {
            label: 'date-not-leap-year'
          }
        }]
      }
    }
  }
  return null
}

module.exports = { validateDate }
