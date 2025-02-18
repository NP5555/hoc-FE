import { useRouter } from 'next/router'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Box,
  Pagination,
  CircularProgress,
  FormControl
} from '@mui/material'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from 'src/views/spinner'
import {
  requestDocuments,
  fetchRequestedDocuments,
  fetchUserDocuments,
  fetchAgentLand,
  deleteRequestedDocuments,
  fetchDocumentByUserId
} from 'src/store/apps/user'
import Icon from 'src/@core/components/icon'
import Link from 'next/link'
import { BASE_URL_API } from 'src/configs/const'

const UserDocumentsPage = () => {
  const [data, setData] = useState([])
  const [requestData, setRequestData] = useState([])
  const [documentCatalog, setDocumentCatalog] = useState([])
  const [page, setPage] = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { userId } = router.query
  const state = useSelector(state => state)
  const dispatch = useDispatch()

  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = e => {
    setSearchQuery(e.target.value)
  }

  const filteredCatalog = documentCatalog.filter(row => row.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const displayedCatalog = searchQuery ? filteredCatalog : documentCatalog

  const loadData = () => {
    if (state?.userDocuments?.userDocumentsData === null) {
      return (
        <Typography variant='h6' align='center' sx={{ paddingTop: '25px', paddingBottom: '25px' }}>
          No Record Found
        </Typography>
      )
    } else if (state?.userDocuments?.userDocumentsData === 'Record not found') {
      return (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      )
    } else {
      setData(state?.userDocuments?.userDocumentsData?.data)
    }
  }

  const loadReqDocument = async () => {
    if (!state?.requestDocument?.requestDoc) {
      setRequestData(null)
    } else if (state?.requestDocument?.requestDoc === 'Record not found') {
      setRequestData([])
    } else {
      setRequestData(state?.requestDocument?.requestDoc?.data)
    }
  }

  const loadDocCatalog = async () => {
    {
      if (state?.document?.documents === null) {
        return (
          <Typography variant='h6' align='center' sx={{ paddingTop: '25px', paddingBottom: '25px' }}>
            No Record Found
          </Typography>
        )
      } else setDocumentCatalog(state?.document?.documents)
    }
  }

  useEffect(() => {
    loadData()
    loadDocCatalog()
    loadReqDocument()
  }, [state?.userDocuments?.userDocumentsData, state?.requestDocument?.requestDoc, state?.document?.documents])

  useEffect(() => {
    dispatch(
      fetchRequestedDocuments({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10,
        userId: userId
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  // fetchDocument

  useEffect(() => {
    if (userId) {
      dispatch(
        fetchDocumentByUserId({
          token: state.reducer.userData.userData.token.accessToken,
          userId: userId
        })
      )
    }
  }, [dispatch, state.reducer.userData.userData.token.accessToken, userId])

  useEffect(() => {
    dispatch(
      fetchRequestedDocuments({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10,
        userId: userId
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken, userId])

  const handlePaginationDocuments = (event, value) => {
    // dispatch(
    //   fetchAgentLand({
    //     token: reducer.userData.userData.token.accessToken,
    //     page: value,
    //     take: 10
    //   })
    // )
    // setPage(value)
  }

  // add document request

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleInputChange = event => {
    setInputValue(event.target.value)
  }

  const handleAddItem = async () => {
    try {
      setIsLoading(true)
      dispatch(
        requestDocuments({
          token: state.reducer.userData.userData.token.accessToken,
          page: 1,
          take: 10,
          message: inputValue,
          userId: userId
        })
      )
    } catch (error) {
    } finally {
      setIsLoading(false)
      handleCloseDialog()
    }
  }

  const handleDeleteRow = async id => {
    try {
      setIsLoading(true)

      let requestData = {
        documentId: id,
        token: state.reducer.userData.userData.token.accessToken,
        userId: userId
      }
      await dispatch(deleteRequestedDocuments(requestData))
    } catch (error) {
      console.error('Error while deleting currency:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = ({ documentName }) => {
    const fileUrl = `${BASE_URL_API}//uploads/${documentName}`

    const anchor = document.createElement('a')
    anchor.href = fileUrl
    anchor.download = documentName

    anchor.click()
    anchor.remove()
  }

  return (
    <div>
      <Box display='flex' justifyContent='center' alignItems='center'>
        <Button variant='outlined' onClick={handleOpenDialog}>
          Add Request
        </Button>
      </Box>
      <Typography align='center' sx={{ textAlign: 'center', marginTop: 10 }} variant='h4' component='h1' gutterBottom>
        Messages
      </Typography>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Add Request</DialogTitle>
        <DialogContent>
          <TextField label='Type your message' value={inputValue} onChange={handleInputChange} fullWidth />
        </DialogContent>
        <DialogActions>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleAddItem} variant='outlined' color='primary'>
                Request
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Messages</TableCell>
            <TableCell align='center'>Delete</TableCell>
          </TableRow>
        </TableHead>
        {!state?.requestDocument?.requestDoc ? (
          <TableBody>
            <TableRow>
              <TableCell align='center' colSpan={3}>
                <Typography variant='h6' align='center' sx={{ paddingTop: '25px', paddingBottom: '25px' }}>
                  No Record Found
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <>
            <TableBody>
              {!requestData ? (
                ''
              ) : (
                <>
                  {requestData.slice().map(row => (
                    <TableRow key={row.id}>
                      <TableCell align='center'>{row.message}</TableCell>
                      <TableCell align='center'>
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
        count={state?.userDocuments?.userDocumentsData?.meta?.pageCount}
        page={page}
        onChange={handlePaginationDocuments}
      />
      <Typography align='center' sx={{ textAlign: 'center', marginTop: 10 }} variant='h4' component='h1' gutterBottom>
        Documents
      </Typography>
      <Table sx={{ textAlign: 'center', marginTop: 10 }}>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Name</TableCell>
            <TableCell align='center'>Tag</TableCell>
            <TableCell align='center'>File</TableCell>
          </TableRow>
        </TableHead>
        {!state?.userDocuments?.userDocumentsData ? (
          <TableBody>
            <TableRow>
              <TableCell align='center' colSpan={3}>
                <Typography variant='h6' align='center' sx={{ paddingTop: '25px', paddingBottom: '25px' }}>
                  No Record Found
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <>
            <TableBody>
              {!data ? (
                ''
              ) : (
                <>
                  {data.slice().map(row => (
                    <TableRow key={row.id}>
                      <TableCell align='center'>{row.name}</TableCell>
                      <TableCell align='center'>{row.description}</TableCell>
                      <TableCell align='center'>
                        <a href={row.url} download target='_blank' rel='noopener noreferrer'>
                          <Button variant='outlined'>
                            <Icon fontSize='1.125rem' icon='material-symbols:file-download' size={24} />
                          </Button>
                        </a>
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
        count={state?.userDocuments?.userDocumentsData?.meta?.pageCount}
        page={page}
        onChange={handlePaginationDocuments}
      />

      <Typography variant='h4' align='center' sx={{ paddingTop: '25px', paddingBottom: '25px' }}>
        Documents Catalogue
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <TextField
          label='Search'
          variant='outlined'
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ marginBottom: '16px' }}
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Name</TableCell>
            <TableCell align='center'>Download</TableCell>
          </TableRow>
        </TableHead>
        {displayedCatalog === null || displayedCatalog.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell align='center' colSpan={3}>
                <Typography variant='h6' align='center' sx={{ paddingTop: '25px', paddingBottom: '25px' }}>
                  No Record Found
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <>
            <TableBody>
              <>
                {displayedCatalog.slice().map(row => (
                  <TableRow key={row.id}>
                    <TableCell align='center'>{row.name}</TableCell>
                    <TableCell align='center'>
                      <Button variant='outlined'>
                        <Link
                          href={BASE_URL_API + row.document}
                          download={row.name}
                          onClick={handleDownload}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: 'inherit'
                          }}
                        >
                          <Icon fontSize='1.125rem' icon='material-symbols:download' size={24} />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            </TableBody>
          </>
        )}
      </Table>
    </div>
  )
}

export default UserDocumentsPage
