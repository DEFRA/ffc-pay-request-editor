function ViewModel (schemes, error) {
  this.model = {
    schemes: schemes
  }

  if (error) {
    this.model.errorMessage = {
      text: error.message
    }
  }
}

module.exports = ViewModel
