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
          title: 'Projects',
          path: '/public-projects'
        },
        {
          title: 'Lands',
          path: '/dashboards/agentLand'
        }
      ]
    }
  ]
}

export default navigation
