import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'

import React, { useState, useEffect } from 'react'

// import LandDeveloperSale from '../../../../contract-abis/landDeveloperSale.json'

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
import { buyLand, updateRentLand } from 'src/store/apps/user'
import { BASE_URL_API } from 'src/configs/const'
import { ethers } from 'ethers'
import RentLandNFT from '../../../../contract-abis/RentLandNFT.json'

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
  const signer = state.signer.signer

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

  const confirmRentLand = async data => {
    console.log('🚀 ~ file: index.js:89 ~ confirmRentLand ~ data:', data)
    try {
      const tokenId = data.agentLand.tokenId
      const tenant = data.tenant.wallet
      const rentAmount = ethers.utils.parseEther(data.rentAmount)
      const security = ethers.utils.parseEther(data.securityAmount)
      const duration = Number(data.duration) * 86400
      const paymentMethod = Number(data.paymentMethod)

      // const rentLandInstance = new ethers.Contract(RentLandNFT.address, RentLandNFT.abi, signer)

      // const txPutOnRent = await (
      //   await rentLandInstance.putOnRent(tokenId, tenant, rentAmount, security, duration, paymentMethod)
      // ).wait()

      const rentData = {
        token: state.reducer.userData.userData.token.accessToken,
        landId: data.id,
        data: {
          isOnchain: true,
          transactionHash: txListing.transactionHash,
          tag: 'List'
        }
      }

      await dispatch(updateRentLand(rentData))
      router.push('/dashboards/marketplace', undefined, { shallow: true })
    } catch (error) {
      console.log('🚀 ~ file: index.js:206 ~ handleConfirmRent ~ error:', error)
    }
  }

  const handleConfirmRent = async data => {
    try {
      const rentData = {
        token: state.reducer.userData.userData.token.accessToken,
        landId: land,
        data: {
          tenantId: state.reducer.userData.userData.user.id
        }
      }

      await dispatch(updateRentLand(rentData))
      router.push('/dashboards/marketplace', undefined, { shallow: true })
    } catch (error) {
      console.log('🚀 ~ file: index.js:206 ~ handleConfirmRent ~ error:', error)
    }
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
      if (response.statusCode === 404) {
        return
      } else {
        setData(response?.data?.data)
        setPage(page)
      }
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

  const renderSubmitButton = row => (
    <TableCell align='center'>
      {row.owner.id === state.reducer.userData.userData.user.id && (
        <Button onClick={() => confirmRentLand(row)} variant='outlined'>
          <Icon fontSize='1.125rem' icon='formkit:submit' />
        </Button>
      )}
    </TableCell>
  )

  const renderImagePreview = (images, index) => (
    <React.Fragment key={index}>
      <ImagePreviewCell onClick={() => toggleModal(index)}>
        <StyledImage src={images[index]} alt={`Preview ${index}`} />
      </ImagePreviewCell>
      <ImagePreviewModal open={isModalOpen === index} onClose={() => toggleModal(index)}>
        <StyledImage src={images[index]} alt={`Full Preview ${index}`} />
      </ImagePreviewModal>
    </React.Fragment>
  )

  const renderYouTubeLink = (link, index) => (
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
  )

  const renderTableRow = row => (
    <TableRow key={row.id}>
      <TableCell align='center'>
        <Link href={`/rent-land-detail?land=${row.id}`}>
          <Typography>{row.tokenId}</Typography>
        </Link>
      </TableCell>
      <TableCell align='center'>{`${row.owner.firstName} ${row.owner.lastName}`}</TableCell>
      <TableCell align='center'>{row.project.name}</TableCell>
      <TableCell align='center'>{`${row.rentAmount} ${row.currency.name}`}</TableCell>
      <TableCell align='center'>{`${row.securityAmount} ${row.currency.name}`}</TableCell>
      <TableCell align='center'>{convertUnixTimestamp(row.lastPaymentTime)}</TableCell>
      <TableCell align='center'>
        {row.agentLand.landImage && row.agentLand.landImage.length > 0
          ? row.agentLand.landImage.map((image, index) => renderImagePreview(row.agentLand.landImage, index))
          : 'No Images'}
      </TableCell>
      <TableCell align='center'>
        {row.agentLand.youtubeLinks && row.agentLand.youtubeLinks.length > 0
          ? row.agentLand.youtubeLinks.map((link, index) => renderYouTubeLink(link, index))
          : 'No YT Links'}
      </TableCell>
      {row.owner.id === state.reducer.userData.userData.user.id ? null : renderSubmitButton(row)}
    </TableRow>
  )

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
                {data[0]?.owner?.id !== state.reducer.userData.userData.user.id && (
                  <TableCell align='center'>Submit</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => row.owner.id === state.reducer.userData.userData.user.id && renderTableRow(row))}
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
