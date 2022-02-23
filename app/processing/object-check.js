function getObjectKey (obj, key, defaultValue = '') {
  return obj?.[String(key)] ?? defaultValue
}

function getObjectKeyEquals (obj, key, value, defaultValue = '') {
  return obj?.[String(key)] === value ?? defaultValue
}

module.exports = {
  getObjectKey,
  getObjectKeyEquals
}
