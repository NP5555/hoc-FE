import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import Link from 'next/link' // Import the Link component from Next.js
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
  Pagination
} from '@mui/material'
import Spinner from 'src/views/spinner'
import { updateRole, fetchUser } from 'src/store/apps/user'

import LandNftFactory from '../../../../contract-abis/landNftFactory.json'
import LandSaleFactory from '../../../../contract-abis/landSaleFactory.json'
import { ethers } from 'ethers'

const UsersTable = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const state = useSelector(state => state)
  const signer = state.signer.signer

  const dispatch = useDispatch()

  const loadData = () => {
    if (!state?.usersRecord?.userData) {
      return <Spinner />
    } else if (state?.reducer?.userData?.userData?.user?.role !== 'ADMIN') {
      const users = state?.usersRecord?.userData || []
      const filteredUsers = users.filter(user => user.role === 'USER')
      setData(filteredUsers)
    } else setData(state.usersRecord.userData)
  }
  useEffect(() => {
    loadData()
  }, [state?.usersRecord?.userData])

  const [page, setPage] = useState(1)

  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRowId, setSelectedRowId] = useState(null)

  const handleActionClick = (event, rowId) => {
    setAnchorEl(event.currentTarget)
    setSelectedRowId(rowId)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedRowId(null)
  }

  const handleRoleChange = async (event, user, newRole) => {
    try {
      setIsLoading(true)

      if (newRole === 'DEVELOPER') {
        const landNFTInstance = new ethers.Contract(LandNftFactory.address, LandNftFactory.abi, signer)
        const landSaleInstance = new ethers.Contract(LandSaleFactory.address, LandSaleFactory.abi, signer)

        await (
          await landNFTInstance.grantRole(
            '0x4504b9dfd7400a1522f49a8b4a100552da9236849581fd59b7363eb48c6a474c',
            user.wallet
          )
        ).wait()
        await (
          await landSaleInstance.grantRole(
            '0x4504b9dfd7400a1522f49a8b4a100552da9236849581fd59b7363eb48c6a474c',
            user.wallet
          )
        ).wait()
      }

      let data = {
        token: state.reducer.userData.userData.token.accessToken,
        id: user.id,
        role: newRole
      }
      await dispatch(updateRole(data))
    } catch (error) {
      console.log('🚀 ~ file: index.js:100 ~ handleRoleChange ~ error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (event, value) => {
    dispatch(
      fetchUser({
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
            <TableCell>Full Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Wallet</TableCell>
            {state?.reducer?.userData?.userData?.user?.role !== 'ADMIN' ? (
              ''
            ) : (
              <>
                <TableCell>Role</TableCell>
                <TableCell>Referral</TableCell>
                <TableCell>Action</TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        {!state.usersRecord.userData ? (
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
              {data.slice().map(row => {
                if (row.role === 'ADMIN') {
                  return null
                }

                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link href={`/user-documents?userId=${row.id}`} passHref>
                        <Typography>{row.firstName + ' ' + row.lastName}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>
                      {row.wallet.slice(0, 5) + '...' + row.wallet.slice(row.wallet.length - 5, row.wallet.length)}
                    </TableCell>
                    {state?.reducer?.userData?.userData?.user?.role !== 'ADMIN' ? (
                      ''
                    ) : (
                      <>
                        <TableCell>{row.role}</TableCell>
                        <TableCell>{row.referralCode}</TableCell>
                        <TableCell>
                          <IconButton onClick={event => handleActionClick(event, row.id)}>
                            <Icon icon='fluent-mdl2:more-vertical' />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedRowId === row.id}
                            onClose={handleCloseMenu}
                          >
                            <MenuItem onClick={event => handleRoleChange(event, row, 'DEVELOPER')}>
                              {isLoading ? <CircularProgress size={20} /> : 'DEVELOPER'}
                            </MenuItem>
                            <MenuItem onClick={event => handleRoleChange(event, row, 'AGENT')}>
                              {isLoading ? <CircularProgress size={20} /> : 'AGENT'}
                            </MenuItem>
                            <MenuItem onClick={event => handleRoleChange(event, row, 'USER')}>
                              {isLoading ? <CircularProgress size={20} /> : 'USER'}
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
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
        count={state?.reducer?.userData?.userData?.meta?.pageCount}
        page={page}
        onChange={handleChange}
      />
    </>
  )
}

export default UsersTable
