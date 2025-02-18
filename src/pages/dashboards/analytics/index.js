// ** MUI Import
import { Typography, Grid, useMediaQuery, useTheme } from '@mui/material'

// ** Demo Component Imports
import AnalyticsProject from 'src/views/dashboards/analytics/AnalyticsProject'
import AnalyticsOrderVisits from 'src/views/dashboards/analytics/AnalyticsOrderVisits'
import AnalyticsTotalEarning from 'src/views/dashboards/analytics/AnalyticsTotalEarning'
import AnalyticsSourceVisits from 'src/views/dashboards/analytics/AnalyticsSourceVisits'
import AnalyticsEarningReports from 'src/views/dashboards/analytics/AnalyticsEarningReports'
import AnalyticsSupportTracker from 'src/views/dashboards/analytics/AnalyticsSupportTracker'
import AnalyticsSalesByCountries from 'src/views/dashboards/analytics/AnalyticsSalesByCountries'
import AnalyticsMonthlyCampaignState from 'src/views/dashboards/analytics/AnalyticsMonthlyCampaignState'
import AnalyticsWebsiteAnalyticsSlider from 'src/views/dashboards/analytics/AnalyticsWebsiteAnalyticsSlider'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

import { useSelector } from 'react-redux'

// ** Custom Component Import
import KeenSliderWrapper from 'src/@core/styles/libs/keen-slider'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import CardStatsWithAreaChart from 'src/@core/components/card-statistics/card-stats-with-area-chart'
import { useEffect, useState } from 'react'
import { useCallback } from 'react'

import { BASE_URL_API } from 'src/configs/const'

const AnalyticsDashboard = () => {
  const [data, setData] = useState()
  const state = useSelector(state => state)

  const role = state?.reducer?.userData?.userData?.user?.role

  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // const data = [
  //   { label: 'Total Own Lands', value: 3 },
  //   { label: 'Total Signed Lands', value: 3 },
  //   { label: 'Total Requested Lands', value: 0 },
  //   { label: 'Total Listed Lands', value: 1 }
  // ]

  const userDashboard = useCallback(async () => {
    try {
      let response = await fetch(`${BASE_URL_API}/dashboard?userId=${state.reducer.userData.userData.user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.reducer.userData.userData.token.accessToken}`
        }
      })
      response = await response.json()
      if (response.status === 200) {
        setData(response.data)
      }
    } catch (error) {}
  }, [state.reducer.userData.userData.token.accessToken, data])

  const agentDashboard = useCallback(async () => {
    try {
      let response = await fetch(`${BASE_URL_API}/dashboard/agent?userId=${state.reducer.userData.userData.user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.reducer.userData.userData.token.accessToken}`
        }
      })
      response = await response.json()
      if (response.status === 200) {
        setData(response.data)
      }
    } catch (error) {}
  }, [state.reducer.userData.userData.token.accessToken, data])

  const developerDashboard = useCallback(async () => {
    try {
      let response = await fetch(`${BASE_URL_API}/dashboard/developer`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.reducer.userData.userData.token.accessToken}`
        }
      })
      response = await response.json()
      if (response.status === 200) {
        setData(response.data)
      }
    } catch (error) {}
  }, [state.reducer.userData.userData.token.accessToken, data])

  const adminDashboard = useCallback(async () => {
    try {
      let response = await fetch(`${BASE_URL_API}/dashboard/admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.reducer.userData.userData.token.accessToken}`
        }
      })
      response = await response.json()
      if (response.status === 200) {
        setData(response.data)
      }
    } catch (error) {}
  }, [state.reducer.userData.userData.token.accessToken, data])

  useEffect(() => {
    if (role === 'USER') {
      userDashboard()
    } else if (role === 'AGENT') {
      agentDashboard()
    } else if (role === 'DEVELOPER') {
      developerDashboard()
    } else if (role === 'ADMIN') {
      adminDashboard()
    }
  }, [])

  const landData = [{ totalLands: 100, unsoldLands: 25, inProcessLands: 10, soldLands: 65, totalProjects: 20 }]

  const projectData = {
    totalProjects: 20
  }

  const developerData = {
    totalDevelopers: 50,
    activeDevelopers: 30
  }

  return (
    <ApexChartWrapper>
      <KeenSliderWrapper>
        <Grid container spacing={6}>
          {/* <Grid item xs={12} lg={6}>
            <AnalyticsWebsiteAnalyticsSlider />
          </Grid> */}
          {/* <Grid item xs={12} sm={6} lg={3}>
            <AnalyticsOrderVisits />
          </Grid> */}
          {/* <Grid item xs={12} sm={12} lg={12}>
            <CardStatsWithAreaChart
              stats='97.5k'
              chartColor='success'
              avatarColor='success'
              title='Revenue Generated'
              avatarIcon='tabler:credit-card'
              chartSeries={[{ data: [6, 35, 25, 61, 32, 84, 70] }]}
            />
          </Grid> */}
          {/* <Grid item xs={12} md={12}>
            <AnalyticsEarningReports />
          </Grid> */}
          {/* <Grid item xs={12} md={12}>
            <AnalyticsSupportTracker />
          </Grid> */}
          {/* <Grid item xs={12} md={6} lg={4}>
            <AnalyticsSalesByCountries />
          </Grid> */}
          {/* <Grid item xs={12} md={6} lg={4}>
            <AnalyticsTotalEarning />
          </Grid> */}
          {/* <Grid item xs={12} md={6} lg={4}>
            <AnalyticsMonthlyCampaignState />
          </Grid> */}
          {/* <Grid item xs={12} md={6} lg={4}>
            <AnalyticsSourceVisits />
          </Grid> */}

          {role === 'ADMIN' ? (
            <Grid container justifyContent='center' alignItems='center'>
              <Grid item xs={12} lg={12}>
                <Typography
                  variant={isSmallScreen ? 'h5' : 'h4'}
                  component='h1'
                  align='center'
                  color='primary'
                  gutterBottom
                  style={{
                    fontFamily: '"Exo 2", sans-serif',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                    letterSpacing: '2px',
                    fontWeight: 700
                  }}
                >
                  WELCOME TO THE {role} PANEL
                </Typography>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={data}>
                    <XAxis dataKey='label' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='value' fill='#8884d8' />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          ) : (
            <Grid container justifyContent='center' alignItems='center'>
              <Grid item xs={12} lg={12}>
                <Typography
                  variant={isSmallScreen ? 'h5' : 'h4'}
                  component='h1'
                  align='center'
                  color='primary'
                  gutterBottom
                  style={{
                    fontFamily: '"Exo 2", sans-serif',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                    letterSpacing: '2px',
                    fontWeight: 700
                  }}
                >
                  WELCOME TO THE {role} PANEL
                </Typography>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={data}>
                    <XAxis dataKey='label' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='value' fill='#8884d8' />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}
        </Grid>
      </KeenSliderWrapper>
    </ApexChartWrapper>
  )
}

export default AnalyticsDashboard
