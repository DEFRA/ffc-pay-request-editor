const ViewModel = require('./models/sitemap')

module.exports = {
  method: 'GET',
  path: '/sitemap',
  options: {
    handler: (_request, h) => {
      const sections = [
        {
          title: '',
          links: [
            { href: '/', text: 'Home' }
          ]
        },
        {
          title: 'Unattached reporting datasets',
          links: [
            { href: '/capture', text: 'Capture reporting data' },
            { href: '/capture-debt', text: 'Create new reporting dataset' }
          ]
        },
        {
          title: 'Requests awaiting reporting data',
          links: [
            { href: '/enrich', text: 'Requests awaiting reporting data' }
          ]
        },
        {
          title: 'Awaiting ledger assignment',
          links: [
            { href: '/manual-ledger', text: 'Manual Ledger Assignment' }
          ]
        },
        {
          title: 'Requests awaiting quality check',
          links: [
            { href: '/quality-check', text: 'Ledger assignments awaiting quality check' }
          ]
        },
        {
          title: 'Help',
          links: [
            { href: '/accessibility', text: 'Accessibility statement' },
            { href: '/cookies', text: 'Cookies' },
            { href: '/privacy', text: 'Privacy' }
          ]
        }
      ]

      return h.view('sitemap', new ViewModel(sections))
    }
  }
}
