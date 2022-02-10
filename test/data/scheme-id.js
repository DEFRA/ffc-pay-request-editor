const SCHEME_IDS = [{ schemeId: 1, name: 'SFI' }, { schemeId: 2, name: 'SFI Pilot' }]

const SCHEME_ID_SFI = SCHEME_IDS.find(scheme => scheme.name === 'SFI').schemeId

const SCHEME_ID_SFI_PILOT = SCHEME_IDS.find(scheme => scheme.name === 'SFI Pilot').schemeId

module.exports = {
  SCHEME_ID_SFI,
  SCHEME_ID_SFI_PILOT
}
