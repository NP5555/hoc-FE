import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'

import React, { useState, useEffect } from 'react'
import LandDeveloperSale from '../../../../contract-abis/landDeveloperSale.json'
import HocToken from '../../../../contract-abis/HOC-Token.json'

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
import { tradeLand, fetchAgentLand, updateAgentLand } from 'src/store/apps/user'
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
  const [isLoading, setIsLoading] = useState(false)
  const [sortOrder, setSortOrder] = useState('asc') // Sorting order state
  const [page, setPage] = useState(1)
  const [selectedRow, setSelectedRow] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalOpenVideo, setIsModalOpenVideo] = useState(false)

  const state = useSelector(state => state)

  const signer = state?.signer?.signer
  const dispatch = useDispatch()

  const toggleModal = index => {
    if (isModalOpen === index) {
      setIsModalOpen(null)
    } else {
      setIsModalOpen(index)
    }
  }

  const toggleModalVideo = isModalOpenVideo => {
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

  const handleSellRow = row => {
    setSelectedRow(row)
    setOpenDialog(true)
  }

  const handleConfirmBuy = async () => {
    setIsLoading(true)

    try {
      const landSaleInstance = new ethers.Contract(selectedRow.project.saleAddress, LandDeveloperSale, signer)

      const _tokenId = Number(selectedRow.tokenId)
      const _metadataId = Number(selectedRow.type.blockchainId)
      const _signatureTime = Number(selectedRow.signatureTime) // Unix timestamp
      const _agent = selectedRow.agentWallet // Address of the agent
      const _pSignature = selectedRow.signatures
      const _updateInstallment = selectedRow.updateInstallment

      let tx
      if (selectedRow.project.currency.isNative) {
        tx = await (
          await landSaleInstance.buy(_tokenId, _metadataId, _signatureTime, _agent, _updateInstallment, _pSignature, {
            value: ethers.utils.parseEther(selectedRow.project.price.toString())
          })
        ).wait()
      } else {
        const HOCToken = new ethers.Contract(selectedRow.project.currency.tokenAddress, HocToken, signer)

        const maxAllowance = ethers.constants.MaxUint256

        await (await HOCToken.approve(selectedRow.project.saleAddress, maxAllowance)).wait()

        tx = await (
          await landSaleInstance.buy(_tokenId, _metadataId, _signatureTime, _agent, _updateInstallment, _pSignature)
        ).wait()
        console.log('🚀 ~ file: index.js:139 ~ handleConfirmBuy ~ tx:', tx)
      }

      if (tx.events) {
        let tradeData = {
          token: state.reducer.userData.userData.token.accessToken,
          data: {
            tokenId: selectedRow.tokenId,
            userId: state.reducer.userData.userData.user.id,
            typeId: selectedRow.type.id,
            agentLandId: selectedRow.agentLand.id,
            projectId: selectedRow.project.id,
            isAllInstallmentPaid: true
          }
        }

        let agentLand = {
          token: state.reducer.userData.userData.token.accessToken,
          id: selectedRow.agentLand.id,
          status: 'SOLD'
        }

        await dispatch(tradeLand(tradeData))
        await dispatch(updateAgentLand(agentLand))
      }
    } catch (error) {
      console.log('🚀 ~ file: index.js:92 ~ handleConfirmBuy ~ error:', error)
      toast.error(error.reason)
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
    if (state?.pendingBuy?.pendingBuyData?.data) {
      setData(state?.pendingBuy?.pendingBuyData?.data)
    }
  }, [state?.pendingBuy?.pendingBuyData?.data])

  const opts = {
    height: '400px',
    width: '450px'
  }

  console.log(state?.pendingBuy?.pendingBuyData?.data)

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
                <TableCell align='center'>Buy</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice().map(row => {
                if (!row.isSigned || row.agentLand.status !== 'IN_PROCESS') {
                  return null
                }

                return (
                  <TableRow key={row.id}>
                    <TableCell align='center'>
                      <Link href={`/buy-land-detail?land=${row.id}&type=buy-land`}>
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
                    <TableCell align='center'>
                      <Button onClick={() => handleSellRow(row)} variant='outlined'>
                        <Icon fontSize='1.125rem' icon='icons8:buy' />
                      </Button>
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
