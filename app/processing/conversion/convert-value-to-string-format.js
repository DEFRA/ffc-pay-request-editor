const { convertToPounds } = require('./convert-currency')

const convertValueToStringFormat = (originalValue) => {
  const value = convertToPounds(originalValue)
  if (Math.sign(value) === -1) {
    return `-£${value.toString().replace('-', '')}`
  }
  return `£${value}`
}

module.exports = convertValueToStringFormat
