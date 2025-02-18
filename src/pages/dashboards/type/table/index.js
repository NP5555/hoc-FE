import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { Table, TableHead, TableBody, TableRow, TableCell, Button, Typography, Pagination } from '@mui/material'
import Spinner from 'src/views/spinner'
import { fetchType, deleteType } from 'src/store/apps/user'

const TypeTable = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)

  const state = useSelector(state => state)
  const dispatch = useDispatch()

  const loadData = () => {
    if (state?.types?.typesData === null) {
      return <Spinner />
    } else if (state?.types?.typesData === 'Failed to load data') {
      return (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      )
    } else {
      setData(state?.types?.typesData?.data)
    }
  }

  const handleChange = (event, value) => {
    dispatch(
      fetchType({
        token: state.reducer.userData.userData.token.accessToken,
        page: value,
        take: 5
      })
    )
    setPage(value)
  }

  useEffect(() => {
    loadData()
  }, [state?.types?.typesData])

  const handleDeleteRow = id => {
    dispatch(
      deleteType({
        currencyId: id,
        token: state.reducer.userData.userData.token.accessToken
      })
    )
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Names</TableCell>
            <TableCell align='center'>Description</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        {data === undefined ? (
          <TableBody>
            <TableRow>
              <TableCell align='center' colSpan={3}>
                <Spinner />
              </TableCell>
            </TableRow>
          </TableBody>
        ) : data.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell align='center' colSpan={3}>
                <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
                  Record not found
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.id}>
                  <TableCell align='center'>{row.name}</TableCell>
                  <TableCell align='center'>{row.description}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleDeleteRow(row.id)} variant='outlined'>
                      <Icon fontSize='1.125rem' icon='fluent-mdl2:delete' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        )}
      </Table>
      <Pagination
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '20px',
          paddingBottom: '20px'
        }}
        count={state?.types?.typesData?.meta?.pageCount} // Use the correct property to get the total number of pages
        page={page}
        onChange={handleChange}
      />
    </>
  )
}

export default TypeTable
