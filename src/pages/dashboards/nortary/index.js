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

  const getNortary = async (e) => {
    setNortaryData(null);
    setTransactionHashes([]);
    
    // Get authentication token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setSuccessText('Authentication error: Please log in again');
      return;
    }
    
    // Validate required fields
    if (!tokenId) {
      setSuccessText('Please enter a Property ID');
      return;
    }
    
    if (!nftAddress) {
      setSuccessText('Please select a project');
      return;
    }
    
    setSuccessText('Searching...');
    
    try {
      // Log the request for debugging
      console.log(`Fetching notary data for tokenId: ${tokenId}, nftAddress: ${nftAddress}`);
      
      const response = await fetch(
        `${BASE_URL_API}/trade/nortary?tokenId=${tokenId}&nftAddress=${nftAddress}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          }
        }
      );
      
      console.log('Response status:', response.status);
      
      // Handle different response statuses
      if (response.status === 404) {
        setSuccessText('No property records found with the provided details');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: Failed to fetch property data`);
      }
      
      const result = await response.json();
      
      // Check if we have data
      if (result && result.data) {
        setNortaryData(result.data.user || {});
        setTransactionHashes(result.data.transactions || []);
        setSuccessText('');
      } else {
        setNortaryData({});
        setTransactionHashes([]);
        setSuccessText('No data found for this property');
      }
    } catch (error) {
      console.error('Error fetching notary data:', error);
      setSuccessText(`Error: ${error.message || 'Failed to fetch property data'}`);
      setNortaryData(null);
      setTransactionHashes([]);
    }
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
      <Typography variant="h4" gutterBottom>
        Property Notary Information
      </Typography>
      <Typography variant="body1" paragraph>
        Search for property details and transaction history by selecting a project and entering a property ID. This tool allows you to verify ownership records and transaction history for any property in the system.
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Note: You must be logged in to access property records. If no results are found, it may indicate that the property doesn't exist or hasn't been registered in the system yet.
      </Typography>
      
      <form onSubmit={handleFormSubmit}>
        <div>
          <TextField
            label='Select Project'
            select
            variant='outlined'
            value={nftAddress}
            onChange={handleDropdownChange}
            style={{ minWidth: '200px', marginRight: '16px' }}
            error={!nftAddress}
            helperText={!nftAddress ? 'Required' : ''}
          >
            {data && data.length > 0 ? (
              data.map(option => (
                <MenuItem key={option.id} value={option.nftAddress}>
                  {option.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No projects available</MenuItem>
            )}
          </TextField>
          <TextField
            label='Enter Property ID'
            type='number'
            variant='outlined'
            value={tokenId}
            onChange={handleInputChange}
            style={{ minWidth: '200px' }}
            error={tokenId === ''}
            helperText={tokenId === '' ? 'Required' : ''}
          />
        </div>
        <Button 
          type='submit' 
          variant='contained' 
          color='primary' 
          style={{ marginTop: '16px' }}
          disabled={!nftAddress || tokenId === ''}
        >
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
          {Object.entries(nortaryData).length > 0 ? (
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Property Information</strong></TableCell>
                    <TableCell><strong>Value</strong></TableCell>
                  </TableRow>
                </TableHead>
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
          ) : tokenId && nftAddress && !successText ? (
            <Paper style={{ padding: '20px', marginTop: '20px' }}>
              <Typography variant="body1" color="textSecondary">
                No property information found. Please verify the property ID and try again.
              </Typography>
            </Paper>
          ) : null}

          {transactionHashes && transactionHashes.length > 0 ? (
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'><strong>Transaction Hash</strong></TableCell>
                    <TableCell align='center'><strong>Action</strong></TableCell>
                    <TableCell align='center'><strong>Date</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionHashes.map((hash, index) => (
                    <TableRow key={index}>
                      <TableCell align='center'>
                        <a 
                          href={`https://polygonscan.com/tx/${hash.hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={classes.link}
                        >
                          {hash.hash.slice(0, 8)}...{hash.hash.slice(-8)}
                        </a>
                      </TableCell>
                      <TableCell align='center'>{hash.action || 'Transaction'}</TableCell>
                      <TableCell align='center'>{formatDate(hash.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : successText ? (
            <Paper style={{ padding: '20px', marginTop: '20px' }}>
              <Typography variant="body1" color="textSecondary">
                No transaction history found for this property.
              </Typography>
            </Paper>
          ) : null}
        </>
      ) : null}
    </Container>
  )
}

export default HomePage
