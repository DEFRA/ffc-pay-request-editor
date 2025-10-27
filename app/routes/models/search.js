function viewModel (details, generalError = null) {
  this.model = {
    id: details.id || 'user-search-frn',
    name: 'frn',
    type: 'text',
    labelText: details.labelText,
    labelClasses: 'govuk-!-font-weight-bold',
    isPageHeading: false,
    classes: 'govuk-input--width-20',
    inputmode: 'numeric',
    value: details.value || '',
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
}

module.exports = viewModel
