const SearchViewModel = require('./search')

function viewModel (details, select, generalError) {
  this.model = {
    input: new SearchViewModel(details, generalError).model,
    select: {
      id: 'user-search-scheme',
      name: 'scheme',
      label: {
        text: select.labelText
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

module.exports = viewModel
