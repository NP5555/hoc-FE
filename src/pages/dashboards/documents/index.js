// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid' //
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import DocumentTable from './table'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchDocument } from 'src/store/apps/user'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/documents/list/TableHeader'
import AddDocumentDrawer from 'src/views/apps/documents/list/AddDocumentDrawer'

const Document = () => {
  // ** State
  const [role, setRole] = useState('')
  const [value, setValue] = useState('')
  const [addUserOpen, setAddUserOpen] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  // Load documents when component mounts with pagination
  useEffect(() => {
    if (state.reducer.userData?.userData?.token?.accessToken) {
      console.log('Loading initial documents data')
      dispatch(
        fetchDocument({
          token: state.reducer.userData.userData.token.accessToken,
          page: 1,
          take: 10
        })
      )
    }
  }, [dispatch, state.reducer.userData?.userData?.token?.accessToken])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleRoleChange = useCallback(e => {
    setRole(e.target.value)
  }, [])

  const toggleAddDocumentDrawer = () => setAddUserOpen(!addUserOpen)

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Documents' />
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader
            value={value}
            handleFilter={handleFilter}
            role={role}
            handleRoleChange={handleRoleChange}
            toggle={toggleAddDocumentDrawer}
          />
          <DocumentTable />
        </Card>
      </Grid>

      <AddDocumentDrawer open={addUserOpen} toggle={toggleAddDocumentDrawer} />
    </Grid>
  )
}

export default Document
