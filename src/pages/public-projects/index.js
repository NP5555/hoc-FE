// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import PublicProjectTable from './table'
import { Typography, TextField, Box } from '@mui/material'

// ** Store Imports
import { useSelector } from 'react-redux'
import { BASE_URL_API } from 'src/configs/const'

const PublicProjects = () => {
  // ** State
  const [value, setValue] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // ** Hooks
  const state = useSelector(state => state)

  // Load public projects
  const loadPublicProjects = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${BASE_URL_API}/project/public?page=${page}&take=10&q=${value}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (response.ok && result.status === 200) {
        setProjects(result.data?.data || [])
        setTotalPages(result.data?.meta?.pageCount || 1)
      } else {
        console.error('Failed to load public projects:', result)
        setProjects([])
      }
    } catch (error) {
      console.error('Error loading public projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPublicProjects()
  }, [page, value])

  const handleFilter = useCallback(val => {
    setValue(val)
    setPage(1) // Reset to first page when searching
  }, [])

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Available Projects' 
            subheader='Browse all available projects from our platform'
          />
          <Divider sx={{ m: '0 !important' }} />
          
          {/* Search Filter */}
          <Box sx={{ p: 4 }}>
            <TextField
              size='small'
              value={value}
              sx={{ mr: 4 }}
              placeholder='Search Projects'
              onChange={e => handleFilter(e.target.value)}
            />
          </Box>

          <PublicProjectTable 
            projects={projects}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export default PublicProjects 