// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import DocumentsTable from './table'
import TableHeader from 'src/views/apps/addDocument/list/TableHeader'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchUserDocuments, fetchRequestedDocuments, fetchDocument } from 'src/store/apps/user'

// ** Custom Table Components Imports
import AddDocumentDrawer from 'src/views/apps/addDocument/list/AddAddDocumentDrawer'

const AddDocument = () => {
  // ** State
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [value, setValue] = useState('')

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  useEffect(() => {
    dispatch(
      fetchUserDocuments({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10,
        userId: state?.reducer?.userData?.userData?.user?.id
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  useEffect(() => {
    dispatch(
      fetchDocument({
        token: state.reducer.userData.userData.token.accessToken
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  useEffect(() => {
    dispatch(
      fetchRequestedDocuments({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10,
        userId: state?.reducer?.userData?.userData?.user?.id
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  const toggleAddDocumentDrawer = () => setAddUserOpen(!addUserOpen)

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Filters' />
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader value={value} handleFilter={handleFilter} toggle={toggleAddDocumentDrawer} />
          <DocumentsTable />
        </Card>
      </Grid>

      <AddDocumentDrawer open={addUserOpen} toggle={toggleAddDocumentDrawer} />
    </Grid>
  )
}

export default AddDocument
