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
  TablePagination,
  CircularProgress,
  Pagination
} from '@mui/material'
import Spinner from 'src/views/spinner'
import { deleteArea, fetchArea } from 'src/store/apps/user'

const AreaTable = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const state = useSelector(state => state)
  const dispatch = useDispatch()

  const loadData = () => {
    if (state?.areaRecord?.areaData === null) {
      return <Spinner />
    } else setData(state?.areaRecord?.areaData)
  }

  useEffect(() => {
    loadData()
  }, [state?.areaRecord?.areaData])

  const [page, setPage] = useState(1)

  const handleDeleteRow = async id => {
    try {
      setIsLoading(true)

      let requestData = {
        areaId: id,
        token: state.reducer.userData.userData.token.accessToken
      }
      await dispatch(deleteArea(requestData))
    } catch (error) {
      console.error('Error while deleting area:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (event, value) => {
    dispatch(
      fetchArea({
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
        {state?.areaRecord?.areaData === null ? (
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
        count={state?.areaRecord?.areaData?.meta?.pageCount}
        page={page}
        onChange={handleChange}
      />
    </>
  )
}

export default AreaTable
