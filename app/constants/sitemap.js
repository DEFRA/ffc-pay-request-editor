const HOME = { href: '/', text: 'Home' }

const CAPTURE_LINKS = [
  { href: '/capture', text: 'Manage unattached reporting data' },
  { href: '/capture-debt', text: 'Create new reporting dataset' }
]

const ENRICH_LINKS = [
  { href: '/enrich', text: 'View awaiting reporting data' }
]

const MANUAL_LEDGER_LINKS = [
  { href: '/manual-ledger', text: 'Manual Ledger Assignment' }
]

const QUALITY_CHECK_LINKS = [
  { href: '/quality-check', text: 'Ledger assignments awaiting quality check' }
]

const HELP_LINKS = [
  { href: '/accessibility', text: 'Accessibility statement' },
  { href: '/cookies', text: 'Cookies' },
  { href: '/privacy', text: 'Privacy' },
]

module.exports = [
  { title: '', links: [HOME] },
  { title: 'Unattached reporting datasets', links: CAPTURE_LINKS },
  { title: 'Requests awaiting reporting data', links: ENRICH_LINKS },
  { title: 'Awaiting ledger assignment', links: MANUAL_LEDGER_LINKS },
  { title: 'Requests awaiting quality check', links: QUALITY_CHECK_LINKS },
  { title: 'Help', links: HELP_LINKS },
]
