const toCurrencyString = require('../../utils/to-currency-string')
const { convertToPounds } = require('./convert-currency')

const convertValueToStringFormat = (originalValue) => {
  const value = convertToPounds(originalValue)
  return toCurrencyString(value)
}

module.exports = convertValueToStringFormat
