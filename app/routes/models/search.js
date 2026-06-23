function viewModel (details, value = null, generalError = null) {
  this.model = {
    id: details.id || 'user-search-frn',
    name: 'frn',
    type: 'text',
    labelText: details.labelText,
    isPageHeading: false,
    classes: 'govuk-input--width-20',
    inputmode: 'numeric',
    value: details.value ? value : '',
    hintText: details.hintText || '',
    errorText: details.error ? details.error.message : generalError?.message || undefined,
    buttonText: 'Search',
    buttonType: 'submit'
  }

  if (generalError) {
    this.model.errorMessage = {
      text: generalError.message
    }
  }

  this.frn = value
}

module.exports = viewModel
