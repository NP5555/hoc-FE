import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
  Typography,
  Chip,
  Pagination,
  Link
} from '@mui/material'
import Spinner from 'src/views/spinner'
import { updateKycStatus, fetchKyc } from 'src/store/apps/user'

const UsersTable = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRowId, setSelectedRowId] = useState(null)

  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const router = useRouter()

  const loadData = () => {
    if (!state?.userKYC?.userKYC) {
      return <Spinner />
    } else if (state?.userKYC?.userKYC?.data === 'Failed to load data') {
      return (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      )
    } else {
      setData(state?.userKYC?.userKYC?.data)
    }
  }
  useEffect(() => {
    loadData()
  }, [state?.userKYC?.userKYC])

  const handleActionClick = (event, rowId) => {
    setAnchorEl(event.currentTarget)
    setSelectedRowId(rowId)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedRowId(null)
  }

  const handleKYC = async (event, rowId, newStatus) => {
    try {
      setIsLoading(true)

      let data = {
        token: state.reducer.userData.userData.token.accessToken,
        id: rowId,
        status: newStatus
      }
      await dispatch(updateKycStatus(data))
    } catch (error) {
      console.log('🚀 ~ file: index.js:73 ~ handleKYC ~ error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (event, value) => {
    dispatch(
      fetchKyc({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10
      })
    )
    setPage(value)
  }

console.log(state?.userKYC?.userKYC?.data)
console.log("data", data)


  return (
    <>
      {data === null? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      ) : data === 'Failed to load data' ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          {!data? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={5}>
                  <Spinner />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <>
              <TableBody>
                {data.slice().map(row => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link href={`/user-kyc?userId=${row.user.id}`} passHref>
                        <Typography>{row.firstName + ' ' + row.lastName}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.mobileNumber}</TableCell>
                    <TableCell>
                      <Chip label={row.status} />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={event => handleActionClick(event, row.id)}>
                        <Icon icon='fluent-mdl2:more-vertical' />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedRowId === row.id}
                        onClose={handleCloseMenu}
                      >
                        <MenuItem onClick={event => handleKYC(event, row.id, 'approved')}>
                          {isLoading ? <CircularProgress size={20} /> : 'ACCEPT'}
                        </MenuItem>
                        <MenuItem onClick={event => handleKYC(event, row.id, 'rejected')}>
                          {isLoading ? <CircularProgress size={20} /> : 'REJECT'}
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
        </Table>
      )}

      <Pagination
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '20px',
          paddingBottom: '20px'
        }}
        count={state?.kyc?.kyc?.meta?.pageCount}
        page={page}
        onChange={handleChange}
      />
    </>
  )
}

export default UsersTable
