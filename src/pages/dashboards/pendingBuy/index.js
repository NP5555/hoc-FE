// ** React Imports
import { useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid' //

import LandTable from './table'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchBuysByUserId } from 'src/store/apps/user'

const LandList = ({ apiData }) => {
  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  useEffect(() => {
    dispatch(
      fetchBuysByUserId({
        token: state.reducer.userData.userData.token.accessToken,
        userId: state?.reducer?.userData?.userData?.user?.id,
        page: 1,
        take: 10
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <LandTable />
        </Card>
      </Grid>
    </Grid>
  )
}

export default LandList
