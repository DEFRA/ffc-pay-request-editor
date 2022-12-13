const hoek = require('@hapi/hoek')

const get = (request, key) => {
  let object = request.yar.get(key)
  if (object == null) {
    object = {}
  }
  return object
}

const set = (request, key, value) => {
  request.yar.set(key, value)
}

const update = (request, key, object) => {
  const existing = get(request, key)
  hoek.merge(existing, object, { mergeArrays: false })
  set(request, key, existing)
}

const clear = (request, key) => {
  request.yar.clear(key)
}

module.exports = {
  get,
  set,
  update,
  clear
}
