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
import { buyLand, fetchAgentLand } from 'src/store/apps/user'
import { ethers } from 'ethers'

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

const MyTable = () => {
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

  const handleChange = (event, value) => {
    dispatch(
      fetchAgentLand({
        token: state.reducer.userData.userData.token.accessToken,
        page: value,
        take: 10
      })
    )
    setPage(value)
  }

  useEffect(() => {
    if (state?.trade?.trade?.data) {
      setData(state?.trade?.trade?.data)
    }
  }, [state?.trade?.trade?.data])

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
                <TableCell align='center'>Token ID</TableCell>
                <TableCell align='center'>Agent Name</TableCell>
                <TableCell align='center'>Project Name</TableCell>
                <TableCell align='center'>Project Type</TableCell>
                <TableCell align='center'>Project Category</TableCell>
                <TableCell align='center'>Price</TableCell>
                <TableCell align='center'>Image</TableCell>
                <TableCell align='center'>Video</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice().map(row => {
                if (!row.isListed) {
                  return null
                }

                return (
                  <TableRow key={row.id}>
                    <TableCell align='center'>
                      <Link href={`/land-detail?land=${row.id}`} passHref>
                        <Typography>{row.tokenId}</Typography>
                      </Link>
                    </TableCell>
                    {/* <TableCell align='center'>{row.tokenId}</TableCell> */}
                    <TableCell align='center'>
                      {row.user.firstName} {row.user.lastName}
                    </TableCell>
                    <TableCell align='center'>{row.project.name}</TableCell>
                    <TableCell align='center'>{row.type.name}</TableCell>
                    <TableCell align='center'>{row.project.category.name}</TableCell>
                    <TableCell align='center'>
                      {row.price} {row.project.currency.name}
                    </TableCell>
                    {/* <TableCell align='center'>
                      <Chip label={row.status} />
                    </TableCell> */}
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

export default MyTable
