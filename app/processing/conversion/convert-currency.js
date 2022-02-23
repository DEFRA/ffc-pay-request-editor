function convertStringToPence (valueInPounds) {
  const currencyArray = valueInPounds.split('.')
  const pounds = currencyArray[0]
  const pence = (currencyArray[1] || '00').padEnd(2, '0')
  return Number(pounds + pence)
}

function convertToPounds (valueInPence) {
  return valueInPence / 100
}

module.exports = {
  convertStringToPence,
  convertToPounds
}
