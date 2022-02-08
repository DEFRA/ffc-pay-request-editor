function ViewModel (labelText, frn, error) {
  this.model = {
    id: 'user-search',
    name: 'frn',
    label: {
      text: labelText,
      classes: 'govuk-!-font-weight-bold'
    },
    input: {
      classes: 'govuk-input--width-20'
    },
    button: {
      classes: 'search-button'
    },
    inputmode: 'numeric',
    value: frn
  }

  if (error) {
    this.model.errorMessage = {
      text: error.message
    }
  }
}

module.exports = ViewModel
