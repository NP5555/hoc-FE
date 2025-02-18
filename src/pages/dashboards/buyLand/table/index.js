import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'

import React, { useState, useEffect } from 'react'

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
import { styled } from '@mui/material/styles'
import YouTube from 'react-youtube'

import Spinner from 'src/views/spinner'
import { toast } from 'react-hot-toast'
import { buyLand, fetchAgentLand } from 'src/store/apps/user'

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
  const [isLoading, setIsLoading] = useState(false)
  const [sortOrder, setSortOrder] = useState('asc') // Sorting order state
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalOpenVideo, setIsModalOpenVideo] = useState(false)

  const state = useSelector(state => state)
  const dispatch = useDispatch()

  // const toggleModal = () => {
  //   setIsModalOpen(!isModalOpen)
  // }

  const toggleModal = index => {
    if (isModalOpen === index) {
      setIsModalOpen(null) // Close the modal if it's already open
    } else {
      setIsModalOpen(index) // Open the modal for the specified image index
    }
  }

  const toggleModalVideo = (isModalOpenVideo) => {
    setIsModalOpenVideo(isModalOpenVideo)
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

  const [selectedRow, setSelectedRow] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

  const handleSellRow = row => {
    setSelectedRow(row)
    setOpenDialog(true)
  }

  const handleConfirmBuy = async () => {
    setIsLoading(true)

    try {
      let requestData = {
        token: state.reducer.userData.userData.token.accessToken,
        wallet: state.reducer.userData.userData.user.wallet,
        tokenId: selectedRow.tokenId,
        typeId: selectedRow.typeId,
        agentWallet: selectedRow.user.wallet,
        agentLandId: selectedRow.id,
        projectId: selectedRow.project.id,
        userId: state?.reducer?.userData?.userData?.user?.id
      }
      await dispatch(buyLand(requestData))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
      setOpenDialog(false)
    }
  }

  const handleCloseDialog = () => {
    setSelectedRow(null)
    setOpenDialog(false)
  }

  useEffect(() => {
    if (state?.agentLand?.agentLandData?.data) {
      setData(state?.agentLand?.agentLandData?.data)
    }
  }, [state?.agentLand?.agentLandData?.data])

  const opts = {
    height: '400px',
    width: '450px'
  }

  return (
    <>
      {state?.agentLand?.agentLandData?.data === null ? (
        <Spinner />
      ) : state?.agentLand?.agentLandData?.data === 'Record not found' ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>Token Id</TableCell>
                <TableCell align='center'>Agent Name</TableCell>
                <TableCell align='center'>Project Name</TableCell>
                <TableCell align='center'>Project Type</TableCell>
                <TableCell align='center'>Project Category</TableCell>
                <TableCell align='center'>Price</TableCell>
                <TableCell align='center'>Status</TableCell>
                <TableCell align='center'>Image</TableCell>
                <TableCell align='center'>Video</TableCell>
                {/* {state?.reducer?.userData?.userData?.user?.role === 'USER' ? (
                  <TableCell align='center'>Buy</TableCell>
                ) : (
                  ''
                )} */}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice().map(row => {
                if (row.status === 'SOLD') {
                  return null
                }

                return (
                  <TableRow key={row.id}>
                    {/* <TableCell align='center'>{row.tokenId}</TableCell> */}
                    <TableCell align='center'>
                      <Link href={`/buy-land-detail?land=${row.id}&type=agent-land`}>
                        <Typography>{row.tokenId}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell align='center'>
                      {row.user.firstName} {row.user.lastName}
                    </TableCell>
                    <TableCell align='center'>{row.project.name}</TableCell>
                    <TableCell align='center'>{row.type.name}</TableCell>
                    <TableCell align='center'>{row.project.category.name}</TableCell>
                    <TableCell align='center'>
                      {row.project.price} {row.project.currency.name}
                    </TableCell>
                    <TableCell align='center'>
                      <Chip label={row.status} />
                    </TableCell>
                    <TableCell align='center'>
                      {row.landImage && row.landImage.length > 0 ? (
                        <>
                          {row.landImage.map((image, index) => (
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
                      {row.youtubeLinks && row.youtubeLinks.length > 0 ? (
                        <>
                          {row.youtubeLinks.map((link, index) => (
                            <React.Fragment key={index}>
                              <Button onClick={() => toggleModalVideo(index)} variant='outlined'>
                                <Icon fontSize='1.125rem' icon='vaadin:youtube' />
                              </Button>

                              <Dialog open={isModalOpenVideo === index} onClose={() => toggleModalVideo(false)}>
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

                    {/* {state?.reducer?.userData?.userData?.user?.role === 'USER' && row.status === 'UNSOLD' ? (
                      <TableCell align='center'>
                        <Button onClick={() => handleSellRow(row)} variant='outlined'>
                          <Icon fontSize='1.125rem' icon='icons8:buy' />
                        </Button>
                      </TableCell>
                    ) : state?.reducer?.userData?.userData?.user?.role !== 'USER' ? (
                      ''
                    ) : (
                      <TableCell align='center'>
                        <Button disabled variant='outlined'>
                          <Icon fontSize='1.125rem' icon='icons8:buy' />
                        </Button>
                      </TableCell>
                    )} */}
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
            count={state?.agentLand?.agentLandData?.meta?.pageCount}
            page={page}
            onChange={handleChange}
          />
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Buy</DialogTitle>
        <DialogContent>Are you sure you want to buy this {selectedRow?.tokenId} land?</DialogContent>
        <DialogActions>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleConfirmBuy} color='success'>
                Buy
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MyTable
