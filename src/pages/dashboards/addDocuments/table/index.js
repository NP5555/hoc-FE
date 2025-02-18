import React, { useState, useEffect, useCallback } from 'react'
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
  Pagination,
  Divider,
  Typography,
  FormControl,
  TextField
} from '@mui/material'

import Link from '@mui/material/Link'
import Spinner from 'src/views/spinner'
import { deleteDocument, fetchRequestedDocuments, fetchUserDocuments, addDocumentCatalog } from 'src/store/apps/user'
import { BASE_URL_API } from 'src/configs/const'

const DocumentsTable = () => {
  const [data, setData] = useState([])
  const [documentCatalog, setDocumentCatalog] = useState([])
  console.log('🚀 ~ file: index.js:28 ~ DocumentsTable ~ documentCatalog:', documentCatalog)
  const [message, setMessage] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const state = useSelector(state => state)
  const dispatch = useDispatch()

  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = e => {
    setSearchQuery(e.target.value)
  }

  const loadData = useCallback(() => {
    if (state?.userDocuments?.userDocumentsData === null) {
      return <Spinner />
    } else setData(state?.userDocuments?.userDocumentsData?.data)

    if (state?.requestDocument?.requestDoc === null) {
      return <Spinner />
    } else setMessage(state?.requestDocument?.requestDoc?.data)
  }, [state.userDocuments.userDocumentsData, state?.requestDocument?.requestDoc])

  const loadDocCatalog = useCallback(() => {
    if (state?.document?.documents === null) {
      return <Spinner />
    } else setDocumentCatalog(state?.document?.documents)
  }, [state.userDocuments.userDocumentsData, state?.document?.documents])

  useEffect(() => {
    loadData()
    loadDocCatalog()
  }, [loadData, loadDocCatalog])

  const [page, setPage] = useState(1)
  const [pageDocument, setPageDocument] = useState(1)

  const handleDownload = ({ documentName }) => {
    const fileUrl = `${BASE_URL_API}//uploads/${documentName}`

    const anchor = document.createElement('a')
    anchor.href = fileUrl
    anchor.download = documentName

    anchor.click()
    anchor.remove()
  }

  const handleDeleteRow = async id => {
    try {
      setIsLoading(true)

      let requestData = {
        documentId: id,
        token: state.reducer.userData.userData.token.accessToken,
        userId: state?.reducer?.userData?.userData?.user?.id
      }
      await dispatch(deleteDocument(requestData))
    } catch (error) {
      console.error('Error while deleting document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async e => {
    try {
      let params = {
        token: state.reducer.userData.userData.token.accessToken,
        data: {
          document: e.target.files[0],
          isAdmin: false,
          userId: state.reducer.userData.userData.user.id
        }
      }
      await dispatch(addDocumentCatalog(params))
    } catch (error) {
      console.log('Error handling file change:', error)
    }
  }

  const handleMessagePagination = (event, value) => {
    fetchRequestedDocuments({
      token: state.reducer.userData.userData.token.accessToken,
      userId: state?.reducer?.userData?.userData?.user?.id,
      page: value,
      take: 10
    })
    setPage(value)
  }

  const handleDocumentPagination = (event, value) => {
    fetchUserDocuments({
      token: state.reducer.userData.userData.token.accessToken,
      userId: state?.reducer?.userData?.userData?.user?.id,
      page: value,
      take: 10
    })
    setPageDocument(value)
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Id</TableCell>
            <TableCell align='center'>Message from Developer</TableCell>
          </TableRow>
        </TableHead>
        {state?.requestDocument?.requestDoc === null ? (
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
              {message === undefined ? (
                ''
              ) : (
                <>
                  {message.slice().map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell align='center'>{index + 1}</TableCell>
                      <TableCell align='center'>{row.message}</TableCell>
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
        count={state?.requestDocument?.requestDoc?.meta?.pageCount}
        page={page}
        onChange={handleMessagePagination}
      />
      <Divider />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Name</TableCell>
            <TableCell align='center'>Tag</TableCell>
            <TableCell align='center'>File</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        {state?.userDocuments?.userDocumentsData === null ? (
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
                      <TableCell align='center'>
                        <a href={row.url} download target='_blank' rel='noopener noreferrer'>
                          <Button variant='outlined'>
                            <Icon fontSize='1.125rem' icon='material-symbols:file-download' size={24} />
                          </Button>
                        </a>
                      </TableCell>
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
        count={state?.userDocuments?.userDocumentsData?.meta?.pageCount}
        page={pageDocument}
        onChange={handleDocumentPagination}
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
            <TableCell align='center'>Upload</TableCell>
          </TableRow>
        </TableHead>
        {!documentCatalog || documentCatalog.length === 0 ? (
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
                {documentCatalog.slice().map(row => (
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

                    <TableCell align='center'>
                      <FormControl fullWidth>
                        <input
                          type='file'
                          accept='.pdf, .doc, .docx'
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                          id='file-upload-input' // Add an id to the input element
                        />
                        <label htmlFor='file-upload-input'>
                          <Button variant='contained' component='span'>
                            <Icon fontSize='1.125rem' icon='material-symbols:upload' size={24} />
                          </Button>
                        </label>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            </TableBody>
          </>
        )}
      </Table>
    </>
  )
}

export default DocumentsTable
