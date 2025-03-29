// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid' //
import MenuItem from '@mui/material/MenuItem' //
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import TypeTable from './table'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Actions Imports
import { fetchType } from 'src/store/apps/user'

// ** Third Party Components
import axios from 'axios'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/type/TableHeader'
import AddTypeDrawer from 'src/views/apps/type/list/AddTypeDrawer'

const Land = () => {
  // ** State
  const [role, setRole] = useState('')
  const [plan, setPlan] = useState('')
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('')
  const [data, setData] = useState('')
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [error, setError] = useState('')

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  useEffect(() => {
    setError('');
    
    // Get user data and token from Redux store
    const userData = state.reducer?.userData?.userData;
    
    if (!userData) {
      setError('User data not available. Please log in again.');
      return;
    }
    
    const token = userData?.token?.accessToken;
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }
    
    // Get developer ID from user data
    const developerId = userData?.user?.id;
    if (!developerId) {
      setError('Developer ID not found. Please ensure you have the correct permissions.');
      return;
    }
    
    console.log('Fetching types with developerId:', developerId);
    
    // Dispatch action with all required parameters
    dispatch(
      fetchType({
        token,
        page: 1,
        take: 10,
        developerId
      })
    ).then(response => {
      if (response?.error) {
        setError(`Failed to load types: ${response.error}`);
      }
    }).catch(err => {
      console.error('Error in fetchType:', err);
      setError('An unexpected error occurred while loading types.');
    });
  }, [dispatch, state.reducer?.userData?.userData])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleRoleChange = useCallback(e => {
    setRole(e.target.value)
  }, [])

  const handlePlanChange = useCallback(e => {
    setPlan(e.target.value)
  }, [])

  const handleStatusChange = useCallback(e => {
    setStatus(e.target.value)
  }, [])
  const toggleAddTypeDrawer = () => setAddUserOpen(!addUserOpen)

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
            toggle={toggleAddTypeDrawer}
          />
          
          {error ? (
            <Typography 
              variant="body1" 
              color="error" 
              sx={{ p: 4, textAlign: 'center' }}
            >
              {error}
            </Typography>
          ) : (
            <TypeTable />
          )}
        </Card>
      </Grid>

      <AddTypeDrawer open={addUserOpen} toggle={toggleAddTypeDrawer} />
    </Grid>
  )
}

export default Land
