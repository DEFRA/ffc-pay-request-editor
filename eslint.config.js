'use strict'

module.exports = require('neostandard')({
  globals: ['describe', 'beforeEach', 'expect', 'test', 'afterEach', 'jest', 'beforeAll', 'afterAll'],
  ignores: ['app/dist/**/*.js', 'test/acceptance/**/*.js', 'test/acceptance/**/*.mjs', 'test/acceptance/**/*.cjs'],
})
