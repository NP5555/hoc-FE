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
  TablePagination,
  CircularProgress,
  Pagination,
  Typography
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import Spinner from 'src/views/spinner'
import { deleteCurrency, fetchBuysByUserId } from 'src/store/apps/user'

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}))

const CurrencyTable = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const classes = useStyles()

  const loadData = () => {
    if (!state?.currency?.currencyData) {
      return <Spinner />
    } else if (
      state?.currency?.currencyData === 'Failed to load data' ||
      state?.currency?.currencyData === 'Record not found'
    ) {
      return (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      )
    } else {
      setData(state?.currency?.currencyData?.data)
    }
  }
  useEffect(() => {
    loadData()
  }, [state?.currency?.currencyData])

  const [page, setPage] = useState(1)

  const handleDeleteRow = async id => {
    try {
      setIsLoading(true)

      let requestData = {
        currencyId: id,
        token: state.reducer.userData.userData.token.accessToken
      }
      await dispatch(deleteCurrency(requestData))
    } catch (error) {
      console.error('Error while deleting currency:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (event, value) => {
    fetchBuysByUserId({
      token: state.reducer.userData.userData.token.accessToken,
      userId: state?.reducer?.userData?.userData?.user?.id,
      page: value,
      take: 10
    })
    setPage(value)
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Name</TableCell>
            <TableCell align='center'>Token Address</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        {state?.currency?.currencyData === null ? (
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
                <TableRow>
                  <TableCell colSpan={3}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {data.slice().map(row => (
                    <TableRow key={row.id}>
                      <TableCell align='center'>{row.name}</TableCell>
                      {row.isNative ? (
                        <TableCell align='center'>Native Currency</TableCell>
                      ) : (
                        <>
                          <TableCell align='center'>
                            <a
                              href={`https://polygonscan.com/address/${row.tokenAddress}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className={classes.link}
                            >
                              {row.tokenAddress.slice(0, 5) +
                                '...' +
                                row.tokenAddress.slice(row.tokenAddress.length - 5, row.tokenAddress.length - 1)}
                            </a>
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        {isLoading ? (
                          <Button>
                            <CircularProgress size={18} />
                          </Button>
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
        count={state?.currency?.currencyData?.meta?.pageCount}
        page={page}
        onChange={handleChange}
      />
    </>
  )
}

export default CurrencyTable
