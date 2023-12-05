const replaceSFI22 = (dbExtract) => {
  for (let i = 0; i < dbExtract.length; i++) {
    if (dbExtract[i].name === 'SFI') {
      dbExtract[i].name = 'SFI22'
    }
    if (dbExtract[i].schemes?.name === 'SFI') {
      dbExtract[i].schemes.name = 'SFI22'
    }
    if (dbExtract[i].ledgerPaymentRequest?.schemes?.name === 'SFI') {
      dbExtract[i].ledgerPaymentRequest.schemes.name = 'SFI22'
    }
    if (dbExtract[i].paymentRequest?.schemes?.name === 'SFI') {
      dbExtract[i].paymentRequest.schemes.name = 'SFI22'
    }
  }
  return dbExtract
}

module.exports = {
  replaceSFI22
}
