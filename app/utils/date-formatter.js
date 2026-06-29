const format = number => {
  const integer = Number.parseInt(number)
  return integer < 10 ? `0${integer}` : `${integer}`
}

module.exports = format
