const mapExtract = (fullData) => {
  return fullData.map(data => {
    return {
      scheme: data.schemes.name,
      frn: data.frn,
      agreementNumber: data.reference ?? 'Manual enrichment',
      netValue: data.netValueText.replace(/,/g, ''),
      debtType: data.debtTypeText,
      dateOfDiscovery: data.recoveryDate,
      createdBy: data.createdBy,
      status: data.paymentRequestId ? 'Attached' : 'Pending'
    }
  })
}

module.exports = {
  mapExtract
}
