function ViewModel (input, select, generalError) {
  this.model = {
    input: {
      id: 'user-search-frn',
      name: 'frn',
      label: {
        text: input.labelText,
        classes: 'govuk-!-font-weight-bold'
      },
      input: {
        classes: 'govuk-input--width-20'
      },
      inputmode: 'numeric',
      value: input.value
    },
    select: {
      id: 'user-search-scheme',
      name: 'scheme',
      label: {
        text: select.labelText,
        classes: 'govuk-!-font-weight-bold'
      },
      value: select.value,
      error: false,
      options: select.options
    },
    button: {
      classes: 'search-button'
    }
  }

  if (input.error) {
    this.model.error = true
    this.model.input.errorMessage = {
      text: input.error.message
    }
  }

  if (select.error) {
    this.model.error = true
    this.model.select.errorMessage = {
      text: select.error.message
    }
  }

  if (generalError) {
    this.model.error = true
    this.model.input.errorMessage = {
      text: generalError.message
    }
  }
}

module.exports = ViewModel
