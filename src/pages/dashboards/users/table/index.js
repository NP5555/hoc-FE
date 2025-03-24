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
import { toast } from 'react-hot-toast'

import LandNftFactory from '../../../../contract-abis/landNftFactory.json'
import LandSaleFactory from '../../../../contract-abis/landSaleFactory.json'
import { ethers } from 'ethers'

// Add RPC URL for BSC mainnet
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'

const UsersTable = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [adminProvider, setAdminProvider] = useState(null)

  const state = useSelector(state => state)
  const signer = state.signer.signer

  const dispatch = useDispatch()

  useEffect(() => {
    // Create a read-only provider for admin operations
    const provider = new ethers.providers.JsonRpcProvider(BSC_RPC_URL)
    setAdminProvider(provider)
  }, [])

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
      setIsLoading(true);
      console.log('Changing role to:', newRole);

      // Check if the current user is an admin
      const isAdmin = state?.reducer?.userData?.userData?.user?.role === 'ADMIN';

      if (newRole === 'DEVELOPER') {
        // Check if user has a wallet address
        if (!user.wallet) {
          toast.error('User does not have a wallet address. Cannot grant DEVELOPER role.');
          setIsLoading(false);
          return;
        }

        // For admins, we'll skip the blockchain permissions for now and just update the database
        if (isAdmin) {
          toast.success('Admin privilege: Proceeding with role update without blockchain verification.');
          console.log('Admin privilege enabled, skipping blockchain verification');
          
          // Database update only
          let data = {
            token: state.reducer.userData.userData.token.accessToken,
            id: user.id,
            role: newRole
          };
          
          const result = await dispatch(updateRole(data));
          console.log('Role update API response:', result);
          setIsLoading(false);
          return;
        }
        
        // For non-admins, check if signer is available
        if (!signer) {
          toast.error('Blockchain connection not available. Please connect your wallet first.');
          setIsLoading(false);
          return;
        }

        try {
          // Regular blockchain interaction when signer is available
          const landNFTInstance = new ethers.Contract(LandNftFactory.address, LandNftFactory.abi, signer);
          const landSaleInstance = new ethers.Contract(LandSaleFactory.address, LandSaleFactory.abi, signer);

          console.log('Granting role to wallet:', user.wallet);
          
          // Grant role on NFT contract
          const tx1 = await landNFTInstance.grantRole(
            '0x4504b9dfd7400a1522f49a8b4a100552da9236849581fd59b7363eb48c6a474c',
            user.wallet
          );
          console.log('NFT contract transaction submitted:', tx1.hash);
          await tx1.wait();
          console.log('NFT contract transaction confirmed');

          // Grant role on Sale contract
          const tx2 = await landSaleInstance.grantRole(
            '0x4504b9dfd7400a1522f49a8b4a100552da9236849581fd59b7363eb48c6a474c',
            user.wallet
          );
          console.log('Sale contract transaction submitted:', tx2.hash);
          await tx2.wait();
          console.log('Sale contract transaction confirmed');

          toast.success('Blockchain permissions granted successfully.');
        } catch (contractError) {
          console.error('Contract interaction error:', contractError);
          toast.error(`Blockchain error: ${contractError.message || 'Unknown error'}`);
          setIsLoading(false);
          return;
        }
      }

      // Continue with the role update API call if not already done for admin
      if (!(isAdmin && newRole === 'DEVELOPER')) {
        let data = {
          token: state.reducer.userData.userData.token.accessToken,
          id: user.id,
          role: newRole
        };
        
        const result = await dispatch(updateRole(data));
        console.log('Role update API response:', result);
      }
    } catch (error) {
      console.error('Role change error:', error);
      toast.error(`Failed to update role: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
                      {row.wallet 
                        ? row.wallet.slice(0, 5) + '...' + row.wallet.slice(row.wallet.length - 5, row.wallet.length)
                        : 'No wallet'
                      }
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
