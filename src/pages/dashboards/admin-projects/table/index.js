import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Typography,
  Pagination,
  Chip
} from '@mui/material'
import Spinner from 'src/views/spinner'
import { toast } from 'react-hot-toast'
import { BASE_URL_API } from 'src/configs/const'

const AdminProjectTable = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const state = useSelector(state => state)
  const dispatch = useDispatch()

  // Load admin projects
  const loadAdminProjects = async () => {
    try {
      setIsLoading(true)
      const token = state.reducer?.userData?.userData?.token?.accessToken
      
      if (!token) {
        console.error('No access token available')
        return
      }

      const response = await fetch(`${BASE_URL_API}/project/admin/all?page=${page}&take=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()
      
      if (response.ok && result.status === 200) {
        setData(result.data?.data || [])
        setTotalPages(result.data?.meta?.pageCount || 1)
      } else {
        console.error('Failed to load admin projects:', result)
        toast.error('Failed to load projects')
      }
    } catch (error) {
      console.error('Error loading admin projects:', error)
      toast.error('Error loading projects')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (state.reducer?.userData?.userData?.token?.accessToken) {
      loadAdminProjects()
    }
  }, [page, state.reducer?.userData?.userData?.token?.accessToken])

  const handleDeleteProject = async (projectId) => {
    try {
      setIsLoading(true)
      const token = state.reducer?.userData?.userData?.token?.accessToken
      
      const response = await fetch(`${BASE_URL_API}/project/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Project deleted successfully')
        loadAdminProjects() // Reload the list
      } else {
        toast.error('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Error deleting project')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return {
          backgroundColor: '#FFD700', // yellow background
          color: '#000000', // black text
          border: '1px solid #000000' // black border
        }
      case 'CLOSE':
        return {
          backgroundColor: '#000000', // black background
          color: '#FFD700', // yellow text
          border: '1px solid #FFD700' // yellow border
        }
      default:
        return {
          backgroundColor: '#E0E0E0',
          color: '#000000'
        }
    }
  }

  if (isLoading && data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
        <Spinner />
      </div>
    )
  }

  return (
    <>
      {data.length === 0 ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          No projects found. Create a new project to get started.
        </Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>Project Name</TableCell>
                <TableCell align='center'>Description</TableCell>
                <TableCell align='center'>Price</TableCell>
                <TableCell align='center'>Category</TableCell>
                <TableCell align='center'>Currency</TableCell>
                <TableCell align='center'>Status</TableCell>
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell align='center'>{row.name}</TableCell>
                  <TableCell align='center'>
                    {row.description?.length > 50 
                      ? `${row.description.substring(0, 50)}...` 
                      : row.description}
                  </TableCell>
                  <TableCell align='center'>
                    {row.price} {row.currency?.name || ''}
                  </TableCell>
                  <TableCell align='center'>{row.category?.name || 'N/A'}</TableCell>
                  <TableCell align='center'>{row.currency?.name || 'N/A'}</TableCell>
                  <TableCell align='center'>
                    <Chip 
                      label={row.status} 
                      size="small"
                      sx={{ 
                        ...getStatusColor(row.status),
                        '&.MuiChip-root': {
                          borderRadius: '16px',
                          fontWeight: 500
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align='center'>
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Button 
                        onClick={() => handleDeleteProject(row.id)} 
                        variant='outlined'
                        size='small'
                        sx={{
                          borderColor: '#FFD700',
                          color: '#FFD700',
                          '&:hover': {
                            borderColor: '#FFD700',
                            backgroundColor: 'rgba(255, 215, 0, 0.04)'
                          }
                        }}
                      >
                        <Icon fontSize='1.125rem' icon='tabler:trash' />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '20px',
                paddingBottom: '20px'
              }}
              count={totalPages}
              page={page}
              onChange={handlePageChange}
            />
          )}
        </>
      )}
    </>
  )
}

export default AdminProjectTable 