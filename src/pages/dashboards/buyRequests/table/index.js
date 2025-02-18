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
  Pagination
} from '@mui/material'
import { styled } from '@mui/material/styles'

import Spinner from 'src/views/spinner'
import { toast } from 'react-hot-toast'
import { updateBuyRequests, fetchBuyRequests, updateAgentLand } from 'src/store/apps/user'
import { ethers } from 'ethers'
import Link from 'next/link'

import HocToken from '../../../../contract-abis/HOC-Token.json'

import YouTube from 'react-youtube'

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
  const [page, setPage] = useState(1)
  const [selectedRow, setSelectedRow] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalOpenVideo, setIsModalOpenVideo] = useState(false)

  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const signer = state.signer.signer

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
      fetchBuyRequests({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
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
    console.log(selectedRow, selectedRow.updateInstallment)
    try {
      const signingDomain = async () => {
        const domain = {
          name: 'LandSale',
          version: '1.0.0',
          verifyingContract: selectedRow?.project?.saleAddress,
          chainId: 56
        }

        return domain
      }

      const domain = await signingDomain()

      const types = {
        LandSale: [
          { name: '_wallet', type: 'address' },
          { name: '_tokenId', type: 'uint256' },
          { name: '_metadataId', type: 'uint256' },
          { name: '_agent', type: 'address' },
          { name: '_updateInstallment', type: 'bool' },
          { name: '_signatureTime', type: 'uint256' }
        ]
      }

      const time = new Date().valueOf()

      let _wallet = selectedRow?.user?.wallet
      let _tokenId = parseInt(selectedRow?.tokenId)
      let _metadataId = selectedRow.type.blockchainId
      let _agent = selectedRow?.agentWallet
      let _signatureTime = time
      let _updateInstallment = selectedRow?.updateInstallment

      const signature = await signer._signTypedData(domain, types, {
        _wallet,
        _tokenId,
        _metadataId,
        _agent,
        _updateInstallment,
        _signatureTime
      })

      const verified = await ethers.utils.verifyTypedData(
        domain,
        types,
        { _wallet, _tokenId, _metadataId, _agent, _updateInstallment, _signatureTime },
        signature
      )

      console.log('🚀 ~ file: index.js:137 ~ handleConfirmBuy ~ signature:', verified)

      let data = {
        id: selectedRow.id,
        token: state.reducer.userData.userData.token.accessToken,
        signatures: signature,
        signatureTime: time
      }

      await dispatch(updateBuyRequests(data))

      let params = {
        id: selectedRow.agentLandId,
        token: state.reducer.userData.userData.token.accessToken,
        status: 'IN_PROCESS'
      }
      await dispatch(updateAgentLand(params))
    } catch (error) {
      console.log('🚀 ~ file: index.js:173 ~ handleConfirmBuy ~ error:', error)
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
    if (state?.buyRequest?.buyRequestData?.data) {
      setData(state?.buyRequest?.buyRequestData?.data)
    }
  }, [state?.buyRequest?.buyRequestData?.data])

  const opts = {
    height: '400px',
    width: '450px'
  }

  return (
    <>
      {state?.buyRequest?.buyRequestData?.data === null ? (
        <Spinner />
      ) : state?.buyRequest?.buyRequestData?.data === 'Record not found' ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>Costumer Name</TableCell>
                <TableCell align='center'>Token ID</TableCell>
                <TableCell align='center'>Project Name</TableCell>
                <TableCell align='center'>Project Category</TableCell>
                <TableCell align='center'>Price</TableCell>
                <TableCell align='center'>Image</TableCell>
                <TableCell align='center'>Video</TableCell>
                <TableCell align='center'>Sign Transaction</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice().map(row => {
                if (row.isSigned) {
                  return null
                }

                return (
                  <TableRow key={row.id}>
                    <TableCell align='center'>
                      <Link href={`/user-documents?userId=${row.user.id}`} passHref>
                        <Typography>{row.user.firstName + ' ' + row.user.lastName}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell align='center'>{row.tokenId}</TableCell>
                    <TableCell align='center'>{row.project.name}</TableCell>
                    <TableCell align='center'>{row.project.category.name}</TableCell>
                    <TableCell align='center'>
                      {row.project.price} {row.project.currency.name}
                    </TableCell>
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
                        <Icon fontSize='1.125rem' icon='mdi:wallet-outline' />
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
            count={state?.buyRequest?.buyRequestData?.meta?.pageCount}
            page={page}
            onChange={handleChange}
          />
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Sign Transaction</DialogTitle>
        <DialogContent>
          Confirm sign transaction for token Id <b>{selectedRow?.tokenId}</b> in {selectedRow?.project?.name} ?
        </DialogContent>
        <DialogActions>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleConfirmBuy} color='success'>
                Sign Transaction
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MyTable
