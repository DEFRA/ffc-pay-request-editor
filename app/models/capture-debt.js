function ViewModel (schemes, error) {
  const errorMessages = {}

  if (error) {
    errorMessages.summary = error.details.map(x => {
      return {
        text: x.message,
        href: `#${x.context.key}`
      }
    })
  }

  this.model = {
    schemes: schemes,
    errorSummary: errorMessages.summary
  }
}

module.exports = ViewModel
