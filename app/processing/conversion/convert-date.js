function convertDateToDDMMYYYY (dd, mm, yyyy) {
  const day = String(dd).padStart(2, '0')
  const month = String(mm).padStart(2, '0')
  const year = String(yyyy)

  return `${day}/${month}/${year}`
}

module.exports = { convertDateToDDMMYYYY }
