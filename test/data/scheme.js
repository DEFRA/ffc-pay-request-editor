let SCHEMES = [{ schemeId: 1, name: 'SFI' }, { schemeId: 2, name: 'SFI Pilot' }]

const SCHEME_NAMES = SCHEMES.map(scheme => scheme.name)

const SCHEME_NAME_SFI = SCHEMES.find(scheme => scheme.schemeId === 1).name

const SCHEME_NAME_SFI_PILOT = SCHEMES.find(scheme => scheme.schemeId === 2).name

SCHEMES = SCHEME_NAMES

module.exports = {
  SCHEMES,
  SCHEME_NAMES,
  SCHEME_NAME_SFI,
  SCHEME_NAME_SFI_PILOT
}
