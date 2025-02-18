// ** React Imports
import { useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid' //

import UserTable from './table'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

import { fetchUser } from 'src/store/apps/user'

// ** Third Party Components

const UserList = () => {
  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  useEffect(() => {
    dispatch(
      fetchUser({
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
          <UserTable />
        </Card>
      </Grid>
    </Grid>
  )
}

export default UserList
