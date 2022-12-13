module.exports = (num) => {
  const numParts = Math.abs(num).toFixed(2).toString().split('.')
  numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return num >= 0 ? '£' + numParts.join('.') : '-£' + numParts.join('.')
}
