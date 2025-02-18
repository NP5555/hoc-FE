// ** React Imports
import { useEffect } from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'

import BuyTable from './table'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchBuyRequests } from 'src/store/apps/user'

const BuyList = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  useEffect(() => {
    dispatch(
      fetchBuyRequests({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <BuyTable />
        </Card>
      </Grid>
    </Grid>
  )
}

export default BuyList
