// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import AdminProjectTable from './table'
import { Typography, Button } from '@mui/material'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchCategory, fetchCurrency } from 'src/store/apps/user'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/admin-project/list/TableHeader'
import AddAdminProjectDrawer from 'src/views/apps/admin-project/list/AddAdminProjectDrawer'

const AdminProjects = () => {
  // ** State
  const [role, setRole] = useState('')
  const [value, setValue] = useState('')
  const [addProjectOpen, setAddProjectOpen] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  // Load required data when component mounts
  useEffect(() => {
    const token = state.reducer?.userData?.userData?.token?.accessToken
    if (token) {
      // Load categories and currencies for project creation
      dispatch(fetchCategory({ token, page: 1, take: 100 }))
      dispatch(fetchCurrency({ token, page: 1, take: 100 }))
    }
  }, [dispatch, state.reducer?.userData?.userData?.token?.accessToken])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleRoleChange = useCallback(e => {
    setRole(e.target.value)
  }, [])

  const toggleAddProjectDrawer = () => setAddProjectOpen(!addProjectOpen)

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Admin Project Management' 
            subheader='Create and manage projects that will be visible to all users'
          />
          <Divider sx={{ m: '0 !important' }} />
          {error ? (
            <Typography color="error" sx={{ p: 3 }}>
              {error}
            </Typography>
          ) : (
            <>
              <TableHeader
                value={value}
                handleFilter={handleFilter}
                role={role}
                handleRoleChange={handleRoleChange}
                toggle={toggleAddProjectDrawer}
              />
              <AdminProjectTable />
            </>
          )}
        </Card>
      </Grid>

      <AddAdminProjectDrawer open={addProjectOpen} toggle={toggleAddProjectDrawer} />
    </Grid>
  )
}

export default AdminProjects 