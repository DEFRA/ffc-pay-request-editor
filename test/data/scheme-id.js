const SCHEMES = [{ schemeId: 1, name: 'SFI' }, { schemeId: 2, name: 'SFI Pilot' }]

const SCHEME_IDS = SCHEMES.map(scheme => scheme.schemeId)

const SCHEME_ID_SFI = SCHEMES.find(scheme => scheme.name === 'SFI').schemeId

const SCHEME_ID_SFI_PILOT = SCHEMES.find(scheme => scheme.name === 'SFI Pilot').schemeId

module.exports = {
  SCHEMES,
  SCHEME_IDS,
  SCHEME_ID_SFI,
  SCHEME_ID_SFI_PILOT
}
