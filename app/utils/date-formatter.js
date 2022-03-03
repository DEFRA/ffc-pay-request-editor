const format = number => {
  const integer = parseInt(number)
  return integer < 10 ? `0${integer}` : `${integer}`
}

module.exports = format
