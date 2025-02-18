// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid' //
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import LandTable from './table'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchProject, fetchType, fetchUser } from 'src/store/apps/user'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/project/list/TableHeader'
import AddProjectDrawer from 'src/views/apps/project/list/AddProjectDrawer'

const Land = () => {
  // ** State
  const [role, setRole] = useState('')
  const [value, setValue] = useState('')
  const [addUserOpen, setAddUserOpen] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  useEffect(() => {
    dispatch(
      fetchProject({
        token: state.reducer.userData.userData.token.accessToken,
        developerId: state.reducer.userData.userData.user.id,
        page: 1,
        take: 10
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  useEffect(() => {
    dispatch(
      fetchType({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  useEffect(() => {
    dispatch(
      fetchUser({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleRoleChange = useCallback(e => {
    setRole(e.target.value)
  }, [])

  const toggleAddProjectDrawer = () => setAddUserOpen(!addUserOpen)

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Filters' />
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader
            value={value}
            handleFilter={handleFilter}
            role={role}
            handleRoleChange={handleRoleChange}
            toggle={toggleAddProjectDrawer}
          />
          <LandTable />
        </Card>
      </Grid>

      <AddProjectDrawer open={addUserOpen} toggle={toggleAddProjectDrawer} />
    </Grid>
  )
}

export default Land
