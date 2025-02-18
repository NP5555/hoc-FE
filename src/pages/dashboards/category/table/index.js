import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  TablePagination,
  CircularProgress,
  Pagination,
  Typography
} from '@mui/material'
import Spinner from 'src/views/spinner'
import { useDispatch } from 'react-redux'
import { deleteCategory, fetchCategory } from 'src/store/apps/user'

const CategoryTable = () => {
  const [data, setData] = useState([])
  const state = useSelector(state => state)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const dispatch = useDispatch()

  const loadData = () => {
    if (state?.category?.categoryData === null) {
      return <Spinner />
    } else if (
      state?.category?.categoryData === 'Failed to load data' ||
      state?.category?.categoryData === 'Record not found'
    ) {
      return (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      )
    } else setData(state?.category?.categoryData?.data)
  }

  useEffect(() => {
    loadData()
  }, [state.category.categoryData])

  const handleDeleteRow = async id => {
    try {
      setIsLoading(true)

      let data = {
        categoryId: id,
        token: state.reducer.userData.userData.token.accessToken
      }
      await dispatch(deleteCategory(data))
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (event, value) => {
    dispatch(
      fetchCategory({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10
      })
    )
    setPage(value)
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Name</TableCell>
            <TableCell align='center'>Description</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        {state?.category?.categoryData === null ? (
          <TableBody>
            <TableRow>
              <TableCell align='center' colSpan={3}>
                <Spinner />
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <>
            <TableBody>
              {data === undefined ? (
                ''
              ) : (
                <>
                  {data.slice().map(row => (
                    <TableRow key={row.id}>
                      <TableCell align='center'>{row.name}</TableCell>
                      <TableCell align='center'>{row.description}</TableCell>
                      <TableCell>
                        {isLoading ? (
                          <CircularProgress size={24} />
                        ) : (
                          <>
                            <Button onClick={() => handleDeleteRow(row.id)} variant='outlined'>
                              <Icon fontSize='1.125rem' icon='fluent-mdl2:delete' size={24} />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
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
        count={state.category.categoryData?.meta?.pageCount}
        page={page}
        onChange={handleChange}
      />
    </>
  )
}

export default CategoryTable
