const Joi = require('joi')

// change to function and accept one param
// give default property to param
// could split into two joi objects, if param is blank return this else return this.
module.exports = Joi.object({
  date: Joi.date().less('now').iso().raw().required().error(errors => {
    errors.forEach(err => { err.message = 'Debt cannot be discovered in the future' })
    return errors
  })
})
