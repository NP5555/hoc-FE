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
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Chip
} from '@mui/material'
import Spinner from 'src/views/spinner'
import { updateStatus, deleteType } from 'src/store/apps/user'
import { BASE_URL_API } from 'src/configs/const'

const DeveloperTable = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [take, setTake] = useState(10)
  const [anchorEl, setAnchorEl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [meta, setMeta] = useState(null)

  const state = useSelector(state => state)
  const dispatch = useDispatch()

  const loadData = async () => {
    setTake(10)
    try {
      let response = await fetch(`${BASE_URL_API}/users/developer?page=${page}&take=${take}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.reducer.userData.userData.token.accessToken}`
        }
      })
      response = await response.json()
      if (response.status === 200) {
        setData(response.data.data)
        setMeta(response.data.meta)
      } else {
        setData(response.message)
      }
    } catch (error) {
      console.log('🚀 ~ file: index.js:33 ~ loadData ~ error:', error)
    }
  }

  const handleChange = (event, value) => {
    setPage(value)
  }

  const handleActionClick = (event, rowId) => {
    setAnchorEl(event.currentTarget)
    setSelectedRowId(rowId)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedRowId(null)
  }

  const handleStatusChange = async (event, user, isActive) => {
    try {
      setIsLoading(true)

      let data = {
        token: state.reducer.userData.userData.token.accessToken,
        id: user.id,
        isActive: isActive
      }
      await dispatch(updateStatus(data))
    } catch (error) {
      console.log('🚀 ~ file: index.js:100 ~ handleRoleChange ~ error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [isLoading])

  const handleDeleteRow = id => {
    dispatch(
      deleteType({
        currencyId: id,
        token: state.reducer.userData.userData.token.accessToken
      })
    )
  }

  console.log(data)

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Names</TableCell>
            <TableCell align='center'>Email</TableCell>
            <TableCell align='center'>Phone</TableCell>
            <TableCell align='center'>Role</TableCell>
            <TableCell align='center'>Wallet Address</TableCell>
            <TableCell align='center'>Status</TableCell>
            <TableCell align='center'>Action</TableCell>
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
        ) : data.length === 0 || data === 'Failed to load data' ? (
          <Typography align='center'>Record not found</Typography>
        ) : (
          <>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.id}>
                  <TableCell align='center'>{row.firstName + ' ' + row.lastName}</TableCell>
                  <TableCell align='center'>{row.email}</TableCell>
                  <TableCell align='center'>{row.phone}</TableCell>
                  <TableCell align='center'>{row.role}</TableCell>
                  <TableCell align='center'>
                    {row.wallet ? (
                      row.wallet.slice(0, 5) + '...' + row.wallet.slice(row.wallet.length - 5, row.wallet.length - 1)
                    ) : (
                      'Not Set'
                    )}
                  </TableCell>
                  {row.isActive ? (
                    <TableCell align='center'>
                      <Chip label='Active' />
                    </TableCell>
                  ) : (
                    <TableCell align='center'>
                      <Chip label='Inactive' />
                    </TableCell>
                  )}

                  <TableCell>
                    <IconButton onClick={event => handleActionClick(event, row.id)}>
                      <Icon icon='fluent-mdl2:more-vertical' />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedRowId === row.id}
                      onClose={handleCloseMenu}
                    >
                      <MenuItem onClick={event => handleStatusChange(event, row, true)}>
                        {isLoading ? <CircularProgress size={20} /> : 'Active'}
                      </MenuItem>
                      <MenuItem onClick={event => handleStatusChange(event, row, false)}>
                        {isLoading ? <CircularProgress size={20} /> : 'Inactive'}
                      </MenuItem>
                    </Menu>
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
        count={meta?.pageCount || 1}
        page={page}
        onChange={handleChange}
      />
    </>
  )
}

export default DeveloperTable
