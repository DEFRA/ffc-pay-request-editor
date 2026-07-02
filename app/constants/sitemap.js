const HOME = { href: '/', text: 'Home' }

const CAPTURE_LINKS = [
  { href: '/capture', text: 'Manage unattached debt data' },
  { href: '/capture-debt', text: 'Create new debt data' }
]

const ENRICH_LINKS = [
  { href: '/enrich', text: 'View awaiting reporting data' }
]

const MANUAL_LEDGER_LINKS = [
  { href: '/manual-ledger', text: 'View awaiting ledger assignment' }
]

const QUALITY_CHECK_LINKS = [
  { href: '/quality-check', text: 'View ledger assignments to be quality checked' }
]

const HELP_LINKS = [
  { href: '/accessibility', text: 'Accessibility statement' },
  { href: '/cookies', text: 'Cookies' },
  { href: '/privacy', text: 'Privacy' },
]

module.exports = [
  { title: '', links: [HOME] },
  { title: 'Manage unattached debt data', links: CAPTURE_LINKS },
  { title: 'Requests awaiting debt data', links: ENRICH_LINKS },
  { title: 'Manual ledger assignment', links: MANUAL_LEDGER_LINKS },
  { title: 'Ledger assignment quality check', links: QUALITY_CHECK_LINKS },
  { title: 'Help', links: HELP_LINKS },
]
