const Joi = require('joi')

module.exports = {
  applicationIdentifier: Joi.string().regex(/^\w*$/).required().messages({ '*': 'The agreement number is invalid' })
}
