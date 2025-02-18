import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
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
import Link from '@mui/material/Link'
import Spinner from 'src/views/spinner'
import { useDispatch } from 'react-redux'
import { deleteDocumentCatalog, fetchDocument } from 'src/store/apps/user'
import { BASE_URL_API } from 'src/configs/const'

const DocumentTable = () => {
  const [data, setData] = useState([])
  const state = useSelector(state => state)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const dispatch = useDispatch()

  const loadData = () => {
    if (state?.document?.documents === null) {
      return <Spinner />
    } else if (
      state?.document?.documents === 'Failed to load data' ||
      state?.document?.documents === 'Record not found'
    ) {
      return (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      )
    } else setData(state?.document?.documents)
  }

  useEffect(() => {
    loadData()
  }, [state?.document?.documents])

  const handleDownload = ({ documentName }) => {
    const fileUrl = `${BASE_URL_API}//uploads/${documentName}`

    // Create a temporary anchor element
    const anchor = document.createElement('a')
    anchor.href = fileUrl
    anchor.download = documentName

    // Simulate a click event to trigger the download
    anchor.click()

    // Clean up the anchor element
    anchor.remove()
  }

  const handleDeleteRow = async id => {
    try {
      setIsLoading(true)

      let data = {
        documentId: id,
        token: state.reducer.userData.userData.token.accessToken
      }
      await dispatch(deleteDocumentCatalog(data))
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (event, value) => {
    dispatch(
      fetchDocument({
        token: state.reducer.userData.userData.token.accessToken
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
            <TableCell align='center'>Download</TableCell>
            <TableCell align='center'>Delete</TableCell>
          </TableRow>
        </TableHead>
        {state?.document?.documents === null ? (
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
                      <TableCell align='center'>
                        <Button onClick={() => handleDeleteRow(row.id)} variant='outlined'>
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
        count={state.category.categoryData?.meta?.pageCount}
        page={page}
        onChange={handleChange}
      />
    </>
  )
}

export default DocumentTable
