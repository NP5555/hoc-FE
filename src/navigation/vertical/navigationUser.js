const navigation = () => {
  return [
    {
      title: 'Dashboards',
      icon: 'tabler:smart-home',
      children: [
        {
          title: 'Analytics',
          path: '/dashboards/analytics'
        },
        {
          title: 'Documents',
          path: '/dashboards/addDocuments'
        },
        {
          title: 'Buy',
          path: '/dashboards/buyLand'
        },

        {
          title: 'Confirm Buy',
          path: '/dashboards/pendingBuy'
        },
        {
          title: 'Purchases',
          path: '/dashboards/myPurchases'
        },
        {
          title: 'Rents',
          path: '/dashboards/myRentLands'
        },
        {
          title: 'My Listings',
          path: '/dashboards/myListing'
        },
        {
          title: 'Trade Requests',
          path: '/dashboards/pendingTrade'
        },
        {
          title: 'Confirm Trade',
          path: '/dashboards/confirmTrade'
        },
        {
          title: 'Marketplace',
          path: '/dashboards/marketplace'
        },
        {
          title: 'Nortary',
          path: '/dashboards/nortary'
        }
      ]
    }
  ]
}

export default navigation
