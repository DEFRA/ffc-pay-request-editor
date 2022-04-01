const Joi = require('joi')

module.exports = Joi.object({
  date: Joi.date().less('now').iso().raw().required().error(errors => {
    errors.forEach(err => { err.message = 'Debt cannot be discovered in the future' })
    return errors
  })
})
