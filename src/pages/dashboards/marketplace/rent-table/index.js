import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'

import React, { useState, useEffect } from 'react'
import LandDeveloperSale from '../../../../contract-abis/landDeveloperSale.json'

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Pagination,
  Chip,
  Link
} from '@mui/material'
import YouTube from 'react-youtube'

import { styled } from '@mui/material/styles'

import Spinner from 'src/views/spinner'
import { toast } from 'react-hot-toast'
import { buyLand, fetchRentLand } from 'src/store/apps/user'
import { ethers } from 'ethers'
import { BASE_URL_API } from 'src/configs/const'

const ImagePreviewCell = styled(TableCell)(({ theme }) => ({
  cursor: 'pointer',
  '& img': {
    maxHeight: '100px',
    maxWidth: '100%',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: theme.shadows[4]
    }
  }
}))

const StyledImage = styled('img')({
  width: '100%',
  height: 'auto',
  display: 'block',
  borderRadius: '4px'
})

const ImagePreviewModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '80%',
    maxHeight: '80%',
    margin: 'auto',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden'
  }
}))

const RentTable = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalOpenVideo, setIsModalOpenVideo] = useState(false)

  const state = useSelector(state => state)

  const dispatch = useDispatch()

  const toggleModal = index => {
    if (isModalOpen === index) {
      setIsModalOpen(null)
    } else {
      setIsModalOpen(index)
    }
  }

  const toggleModalVideo = () => {
    setIsModalOpenVideo(!isModalOpenVideo)
  }

  const handleChange = async (page, take) => {
    try {
      let response = await fetch(`${BASE_URL_API}/rent?page=${page}&take=${take}`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.reducer.userData.userData.token.accessToken}`
        }
      })
      response = await response.json()
      setData(response?.data?.data)
      console.log('🚀 ~ file: index.js:97 ~ handleChange ~ response:', response.data.data)
      setPage(page)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const convertUnixTimestamp = unixTimestamp => {
    const timestampInMilliseconds = unixTimestamp * 1000
    const lastPaymentTime = new Date().valueOf() + timestampInMilliseconds
    const dateObject = new Date(lastPaymentTime)

    return dateObject.toLocaleString()
  }

  useEffect(() => {
    handleChange(1, 10)
  }, [])

  const opts = {
    height: '400px',
    width: '450px'
  }

  return (
    <>
      {data === null ? (
        <Spinner />
      ) : data === 'Record not found' ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>Token Id</TableCell>
                <TableCell align='center'>Owner Name</TableCell>
                <TableCell align='center'>Project Name</TableCell>
                <TableCell align='center'>Rent Price</TableCell>
                <TableCell align='center'>Rent Security</TableCell>
                <TableCell align='center'>Duration</TableCell>
                <TableCell align='center'>Image</TableCell>
                <TableCell align='center'>Video</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice().map(row => {
                if (row.tenantId !== null) {
                  return null
                }

                return (
                  <TableRow key={row.id}>
                    <TableCell align='center'>
                      <Link href={`/rent-land-detail?land=${row.id}`}>
                        <Typography>{row.tokenId}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell align='center'>
                      {row.owner.firstName} {row.owner.lastName}
                    </TableCell>
                    <TableCell align='center'>{row.project.name}</TableCell>
                    <TableCell align='center'>
                      {row.rentAmount} {row.currency.name}
                    </TableCell>
                    <TableCell align='center'>
                      {row.securityAmount} {row.currency.name}
                    </TableCell>
                    <TableCell align='center'>{convertUnixTimestamp(row.lastPaymentTime)}</TableCell>
                    <TableCell align='center'>
                      {row.agentLand.landImage && row.agentLand.landImage.length > 0 ? (
                        <>
                          {row.agentLand.landImage.map((image, index) => (
                            <React.Fragment key={index}>
                              <ImagePreviewCell onClick={() => toggleModal(index)}>
                                <StyledImage src={image} alt={`Preview ${index}`} />
                              </ImagePreviewCell>
                              <ImagePreviewModal open={isModalOpen === index} onClose={() => toggleModal(index)}>
                                <StyledImage src={image} alt={`Full Preview ${index}`} />
                              </ImagePreviewModal>
                            </React.Fragment>
                          ))}
                        </>
                      ) : (
                        'No Images'
                      )}
                    </TableCell>
                    <TableCell align='center'>
                      {row.agentLand.youtubeLinks && row.agentLand.youtubeLinks.length > 0 ? (
                        <>
                          {row.agentLand.youtubeLinks.map((link, index) => (
                            <React.Fragment key={index}>
                              <Button onClick={() => toggleModalVideo(index)} variant='outlined'>
                                <Icon fontSize='1.125rem' icon='vaadin:youtube' />
                              </Button>

                              <Dialog open={isModalOpenVideo === index} onClose={() => toggleModalVideo(index)}>
                                <DialogContent>
                                  <YouTube videoId={link} opts={opts} />
                                </DialogContent>
                              </Dialog>
                            </React.Fragment>
                          ))}
                        </>
                      ) : (
                        'No YT Links'
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <Pagination
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '20px',
              paddingBottom: '20px'
            }}
            count={state?.trade?.trade?.meta?.pageCount}
            page={page}
            onChange={handleChange}
          />
        </>
      )}
    </>
  )
}

export default RentTable
