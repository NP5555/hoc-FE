import { useState, useEffect } from 'react'
import {
  Container,
  TextField,
  MenuItem,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TableHead
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import toast from 'react-hot-toast'
import { BASE_URL_API } from 'src/configs/const'

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}))

const HomePage = () => {
  const [data, setData] = useState([])
  const [nortaryData, setNortaryData] = useState({})
  const [transactionHashes, setTransactionHashes] = useState([])
  const [nftAddress, setNftAddress] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [successText, setSuccessText] = useState('')
  const [page, setPage] = useState(1)

  const classes = useStyles()

  useEffect(() => {
    fetch(`${BASE_URL_API}/project?page=${page}&take=50`)
      .then(response => response.json())
      .then(data => {
        setData(data.data.data)
      })
      .catch(error => {
        toast.error('Record not found')
      })
  }, [page])

  const handleDropdownChange = event => {
    setNftAddress(event.target.value)
  }

  const handleInputChange = event => {
    setTokenId(event.target.value)
  }

  const formatNaming = objectKeys => {
    const data = objectKeys.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()

    return data.charAt(0).toUpperCase() + data.slice(1)
  }

  const handleFormSubmit = event => {
    event.preventDefault()
    getNortary()

    // setSuccessText(`Success! You selected "${nftAddress}" and entered "${tokenId}".`)
  }

  const getNortary = async () => {
    await fetch(`${BASE_URL_API}/trade/nortary?tokenId=${tokenId}&nftAddress=${nftAddress}`)
      .then(response => response.json())
      .then(data => {
        setNortaryData(data.data.user)
        setTransactionHashes(data.data.transactions)
      })
      .catch(error => {
        console.log('🚀 ~ file: index.js:59 ~ getNortary ~ error:', error)
      })
  }

  const formatDate = isoDate => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: 'UTC' // Set the time zone as needed
    }).format(new Date(isoDate))
  }

  return (
    <Container maxWidth='sm' style={{ textAlign: 'center', marginTop: '50px' }}>
      <form onSubmit={handleFormSubmit}>
        <div>
          <TextField
            label='Select Project'
            select
            variant='outlined'
            value={nftAddress}
            onChange={handleDropdownChange}
            style={{ minWidth: '200px', marginRight: '16px' }}
          >
            {data.map(option => (
              <MenuItem key={option.id} value={option.nftAddress}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label='Enter Property '
            type='number'
            variant='outlined'
            value={tokenId}
            onChange={handleInputChange}
            style={{ minWidth: '200px' }}
          />
        </div>
        <Button type='submit' variant='contained' color='primary' style={{ marginTop: '16px' }}>
          Search
        </Button>
      </form>
      {successText && (
        <Typography variant='h6' style={{ marginTop: '16px', color: 'green' }}>
          {successText}
        </Typography>
      )}

      {nortaryData ? (
        <>
          {Object.entries(nortaryData).length > 0 && (
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
              <Table>
                <TableBody>
                  {Object.entries(nortaryData).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{formatNaming(key)}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {transactionHashes.length > 0 && (
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Transaction Hash</TableCell>
                    <TableCell align='center'>Action</TableCell>
                    <TableCell align='center'>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionHashes.slice().map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell align='center'>
                        <a
                          href={`https://polygonscan.com/tx/${row.transactionHash}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className={classes.link}
                        >
                          {row.transactionHash.slice(0, 8) +
                            '...' +
                            row.transactionHash.slice(row.transactionHash.length - 10, row.transactionHash.length - 1)}
                        </a>
                      </TableCell>
                      <TableCell align='center'>{row.tag.toUpperCase()}</TableCell>
                      <TableCell align='center'>{formatDate(row.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : (
        <>
          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <p>Record not found</p>
          </TableContainer>
        </>
      )}
    </Container>
  )
}

export default HomePage
