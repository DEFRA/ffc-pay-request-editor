const SearchViewModel = require('./search')

function ViewModel (details, select, generalError) {
  this.model = {
    input: new SearchViewModel(details, select, generalError).model,
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
