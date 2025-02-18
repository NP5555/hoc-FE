// ** React Imports
import { useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid' //

import KYCTable from './table'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

import { fetchKyc } from 'src/store/apps/user'
import { Typography } from '@mui/material'

// ** Third Party Components

const KYCList = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  useEffect(() => {
    dispatch(
      fetchKyc({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Typography
          align='center'
          sx={{ paddingTop: '15px', paddingBottom: '15px' }}
          variant='h4'
          component='h1'
          gutterBottom
        >
          KYC (Know Your Costumer)
        </Typography>
        <Card>
          <KYCTable />
        </Card>
      </Grid>
    </Grid>
  )
}

export default KYCList
