// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import LandTable from './table'
import { Typography, Button } from '@mui/material'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchProject, fetchType, fetchUser, addCategory, addCurrency, addProject } from 'src/store/apps/user'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/project/list/TableHeader'
import AddProjectDrawer from 'src/views/apps/project/list/AddProjectDrawer'

const Land = () => {
  // ** State
  const [role, setRole] = useState('')
  const [value, setValue] = useState('')
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  const createTestProject = async () => {
    try {
      setLoading(true)
      const userData = state.reducer?.userData?.userData
      const token = userData?.token?.accessToken
      const developerId = userData?.user?.id

      if (!token || !developerId) {
        setError('Missing authentication data')
        return
      }

      // 1. Create a test category
      await dispatch(addCategory({
        token,
        name: 'Test Category',
        description: 'A test category for projects'
      }))

      // 2. Create a test currency
      await dispatch(addCurrency({
        token,
        data: {
          name: 'Test Currency',
          symbol: 'TST',
          description: 'A test currency'
        }
      }))

      // Wait a bit for the store to update
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Get the created category and currency IDs
      const categoryData = state.category?.categoryData?.data?.[0]
      const currencyData = state.currency?.currencyData?.data?.[0]

      if (!categoryData?.id || !currencyData?.id) {
        setError('Failed to create category or currency')
        return
      }

      // 3. Create the test project
      await dispatch(addProject({
        token,
        name: 'Test Project',
        price: '1000',
        description: 'A test project',
        saleAddress: '0x1234567890123456789012345678901234567890',
        nftAddress: '0x1234567890123456789012345678901234567890',
        categoryId: categoryData.id,
        currencyId: currencyData.id,
        developerId
      }))

      // Wait a bit for the project to be created
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 4. Refresh the projects list
      const projectResponse = await dispatch(fetchProject({
        token,
        developerId,
        page: 1,
        take: 10
      }))

      // Check if the project was created successfully
      if (projectResponse?.error) {
        setError('Failed to refresh project list')
        return
      }

      setLoading(false)
      setError(null)
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Reset error state at the start of the effect
    setError(null)

    // Get user data from Redux state
    const userData = state.reducer?.userData?.userData
    const token = userData?.token?.accessToken
    const developerId = userData?.user?.id

    // Validate required data
    if (!token || !developerId) {
      console.warn('Missing required data:', { 
        hasToken: !!token, 
        hasUserId: !!developerId 
      })
      setError('Unable to fetch projects - missing authentication data')
      return
    }

    console.log('Fetching projects for developer:', developerId)
    
    // Dispatch fetch action with validated data
    dispatch(
      fetchProject({
        token,
        developerId,
        page: 1,
        take: 10
      })
    ).then((response) => {
      console.log('Projects fetch response:', response)
      
      // Check Redux store for projects after dispatch
      setTimeout(() => {
        console.log('Current project data in Redux:', state.project?.projectData)
      }, 500)
    }).catch(error => {
      console.error('Error fetching projects:', error)
      setError(`Error fetching projects: ${error.message || 'Unknown error'}`)
    })
  }, [dispatch, state.reducer?.userData?.userData])

  // Add a new effect to log the project data whenever it changes
  useEffect(() => {
    console.log('Project data updated in Redux:', state.project?.projectData)
    
    if (state.project?.projectData) {
      const { data, meta } = state.project.projectData
      console.log('Project count:', Array.isArray(data) ? data.length : 'Not an array', 
                  'Meta:', meta)
    }
  }, [state.project?.projectData])

  useEffect(() => {
    const userData = state.reducer?.userData?.userData
    const token = userData?.token?.accessToken
    const developerId = userData?.user?.id
    
    if (token) {
      console.log('Fetching types...')
      dispatch(
        fetchType({
          token,
          page: 1,
          take: 10,
          developerId
        })
      ).then(response => {
        console.log('Types fetch response:', response)
      }).catch(error => {
        console.error('Error fetching types:', error)
      })
    }
  }, [dispatch, state.reducer?.userData?.userData])

  useEffect(() => {
    const userData = state.reducer?.userData?.userData
    const token = userData?.token?.accessToken
    
    if (token) {
      console.log('Fetching users...')
      dispatch(
        fetchUser({
          token,
          page: 1,
          take: 10
        })
      ).then(response => {
        console.log('Users fetch response:', response)
      }).catch(error => {
        console.error('Error fetching users:', error)
      })
    }
  }, [dispatch, state.reducer?.userData?.userData])

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
          <CardHeader 
            title='Search Filters' 
            action={
              <Button 
                variant="contained" 
                onClick={createTestProject}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Test Project'}
              </Button>
            }
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
              <LandTable />
            </>
          )}
        </Card>
      </Grid>

      <AddProjectDrawer open={addUserOpen} toggle={toggleAddProjectDrawer} />
    </Grid>
  )
}

export default Land
