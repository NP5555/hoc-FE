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
          title: 'Agents',
          path: '/dashboards/agents'
        },
        {
          title: 'Projects',
          path: '/dashboards/projects'
        },
        {
          title: 'Type',
          path: '/dashboards/type'
        },
        {
          title: 'Lands',
          path: '/dashboards/buyLand'
        },
        {
          title: 'Buy Requests',
          path: '/dashboards/buyRequests'
        }
      ]
    }
  ]
}

export default navigation
