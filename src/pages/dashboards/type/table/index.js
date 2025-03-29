import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Button, 
  Typography, 
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material'
import Spinner from 'src/views/spinner'
import { fetchType, deleteType } from 'src/store/apps/user'

const TypeTable = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const typesData = state?.types?.typesData

  useEffect(() => {
    setLoading(true)
    // Process the data from the Redux store
    if (typesData === null) {
      // Still loading
      setLoading(true)
      setData([])
    } else if (typesData === 'Failed to load data' || typeof typesData === 'string') {
      // Error state
      setLoading(false)
      setError(typesData)
      setData([])
    } else if (typesData?.data) {
      // Success state with data
      setLoading(false)
      setError(null)
      setData(typesData.data)
    } else {
      // Empty or unexpected data
      setLoading(false)
      setData([])
    }
  }, [typesData])

  const handleChange = (event, value) => {
    const userData = state.reducer?.userData?.userData
    const token = userData?.token?.accessToken
    const developerId = userData?.user?.id
    
    if (token && developerId) {
      dispatch(
        fetchType({
          token,
          page: value,
          take: 10,
          developerId
        })
      )
    }
    
    setPage(value)
  }

  const handleDeleteRow = id => {
    const userData = state.reducer?.userData?.userData
    const token = userData?.token?.accessToken
    
    if (token) {
      dispatch(
        deleteType({
          currencyId: id,
          token
        })
      )
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Names</TableCell>
            <TableCell align='center'>Description</TableCell>
            <TableCell align='center'>Actions</TableCell>
          </TableRow>
        </TableHead>
        {data.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell align='center' colSpan={3}>
                <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
                  No types found. Create a new type to get started.
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell align='center'>{row.name}</TableCell>
                <TableCell align='center'>{row.description}</TableCell>
                <TableCell align='center'>
                  <Button onClick={() => handleDeleteRow(row.id)} variant='outlined' color="error" size="small">
                    <Icon fontSize='1.125rem' icon='fluent-mdl2:delete' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
      
      {typesData?.meta && typesData.meta.totalPages > 1 && (
        <Pagination
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '20px',
            paddingBottom: '20px'
          }}
          count={typesData.meta.totalPages}
          page={page}
          onChange={handleChange}
        />
      )}
    </>
  )
}

export default TypeTable
