const getObjectKey = (obj, key, defaultResponse = '') => {
  return obj?.[String(key)] ?? defaultResponse
}

const getObjectKeyEquals = (obj, key, value, defaultResponse = false) => {
  return (obj && Object.hasOwn(obj, String(key))) ? obj[String(key)] === value : defaultResponse
}

module.exports = {
  getObjectKey,
  getObjectKeyEquals
}
