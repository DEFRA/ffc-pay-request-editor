const mapExtract = (fullData) => {
  console.log(fullData)
  return fullData.map(data => {
    return {
      scheme: data.schemes.name,
      frn: data.frn,
      agreementNumber: data.reference ?? 'Manual enrichment',
      netValue: data.netValueText,
      debtType: data.debtTypeText,
      dateOfDiscovery: data.recoveryDate,
      createdBy: data.createdBy,
      status: data.paymentRequestId ?? 'Pending'
    }
  })
}

module.exports = {
  mapExtract
}
