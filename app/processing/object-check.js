function getObjectKey (obj, key, defaultResponse = '') {
  return obj?.[String(key)] ?? defaultResponse
}

function getObjectKeyEquals (obj, key, value, defaultResponse = false) {
  return obj?.[String(key)] === value ?? defaultResponse
}

module.exports = {
  getObjectKey,
  getObjectKeyEquals
}
