import React from 'react'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import { BASE_URL_API } from 'src/configs/const'
import LandNFT from '../../contract-abis/landNft.json'
import RentLandNFT from '../../contract-abis/RentLandNFT.json'
import ERC20Token from '../../contract-abis/HOC-Token.json'

import {
  Typography,
  Container,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogContent,
  Divider,
  DialogTitle,
  DialogActions,
  CircularProgress,
  TextField
} from '@mui/material'
import Lightbox from 'react-image-lightbox'
import { makeStyles } from '@mui/styles'
import 'react-image-lightbox/style.css'

import { useSelector, useDispatch } from 'react-redux'
import YouTube from 'react-youtube'
import Icon from 'src/@core/components/icon'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import { updateRentLand } from 'src/store/apps/user'

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  card: {
    display: 'flex',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer'
  },
  image: {
    height: '100%',
    width: '100%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    objectFit: 'cover'
  }
}))

const NFTPage = () => {
  const [data, setData] = useState()
  const [isModalOpenVideo, setIsModalOpenVideo] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDialogRent, setOpenDialogRent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [endRentTime, setEndRentTime] = useState('')
  const [nextPayment, setNextPayment] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [inputDays, setInputDays] = useState()

  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const router = useRouter()
  const classes = useStyles()
  const { land } = router.query
  const signer = state.signer.signer

  const openLightbox = () => {
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const handleInputDays = e => {
    if (Number(data.duration) < e.target.value) {
      toast.error(`Days must be less than or equal to ${data.duration}`)
    } else {
      setInputDays(e.target.value)
    }
  }

  const toggleModalVideo = () => {
    setIsModalOpenVideo(!isModalOpenVideo)
  }

  const opts = {
    height: '400px',
    width: '450px'
  }

  const handleRent = async () => {
    setOpenDialogRent(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleCloseDialogRent = () => {
    setOpenDialogRent(false)
  }

  const confirmRentLand = async data => {
    try {
      setIsLoading(true)
      const nftContractAddress = data.project.nftAddress
      const tokenAddress = data.currency.isNative ? ethers.constants.AddressZero : data.currency.tokenAddress
      const tokenId = data.agentLand.tokenId
      const tenant = data.tenant.wallet
      const rentAmount = ethers.utils.parseEther(data.rentAmount)
      const security = ethers.utils.parseEther(data.securityAmount)
      const duration = Number(data.duration) * 86400
      const paymentMethod = data.currency.isNative ? 0 : 1

      const rentLandInstance = new ethers.Contract(RentLandNFT.address, RentLandNFT.abi, signer)
      const nftAddress = new ethers.Contract(nftContractAddress, LandNFT, signer)

      let approve = await nftAddress.approve(RentLandNFT.address, Number(tokenId))
      setTxHash(approve.hash)
      approve = await approve.wait()

      let txPutOnRent = await rentLandInstance.putOnRent(
        nftContractAddress,
        tokenAddress,
        tokenId,
        tenant,
        rentAmount,
        security,
        duration,
        paymentMethod
      )
      setTxHash(txPutOnRent.hash)
      txPutOnRent = await txPutOnRent.wait()

      const rentData = {
        token: state.reducer.userData.userData.token.accessToken,
        landId: data.id,
        data: {
          isOnchain: true
        }
      }

      await dispatch(updateRentLand(rentData))
      toast.success('Success')
      router.push('/dashboards/myListing', undefined, { shallow: true })
    } catch (error) {
      if (error.reason || error.message) {
        toast.error(!error.reason ? error.message : error.reason)
      }
      console.log('🚀 ~ file: index.js:206 ~ handleConfirmRent ~ error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePutBackRent = async data => {
    try {
      setIsLoading(true)
      const nftContractAddress = data.project.nftAddress
      const tokenId = data.agentLand.tokenId
      const rentLandInstance = new ethers.Contract(RentLandNFT.address, RentLandNFT.abi, signer)
      let txPutBackent = await rentLandInstance.putBackRent(nftContractAddress, Number(tokenId))
      setTxHash(txPutBackent.hash)
      txPutBackent = await txPutBackent.wait()

      const rentData = {
        token: state.reducer.userData.userData.token.accessToken,
        landId: data.id,
        data: {
          isOnchain: false
        }
      }

      await dispatch(updateRentLand(rentData))
      toast.success('Success')
      router.push('/dashboards/myListing', undefined, { shallow: true })
    } catch (error) {
      if (error.reason || error.message) {
        toast.error(!error.reason ? error.message : error.reason)
      }
      console.log('🚀 ~ file: index.js:206 ~ handleConfirmRent ~ error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRent = async data => {
    try {
      setIsLoading(true)
      const nftContractAddress = data.project.nftAddress
      const tokenId = data.agentLand.tokenId

      const amount = 0.0001

      const totalAmount = data.isVacationRent
        ? (Number(data.rentAmount) + Number(data.securityAmount)) * Number(data.duration) + amount
        : Number(data.rentAmount) + Number(data.securityAmount)
      const rentLandInstance = new ethers.Contract(RentLandNFT.address, RentLandNFT.abi, signer)

      let txAcceptRent
      if (data.currency.isNative) {
        txAcceptRent = await rentLandInstance.acceptOnRent(nftContractAddress, Number(tokenId), {
          value: ethers.utils.parseEther(totalAmount.toString())
        })
        setTxHash(txAcceptRent.hash)
        txAcceptRent = await txAcceptRent.wait()
      } else {
        const ERC20Instance = new ethers.Contract(data.currency.tokenAddress, ERC20Token, signer)
        await (await ERC20Instance.approve(RentLandNFT.address, ethers.constants.MaxInt256)).wait()
        txAcceptRent = await rentLandInstance.acceptOnRent(nftContractAddress, Number(tokenId))
        setTxHash(txAcceptRent.hash)
        txAcceptRent = await txAcceptRent.wait()
      }

      const rentData = {
        token: state.reducer.userData.userData.token.accessToken,
        landId: data.id,
        data: {
          isAcceptByTenant: true,
          acceptRentTime: new Date().valueOf()
        }
      }

      await dispatch(updateRentLand(rentData))
      router.push('/dashboards/myRentLands/', undefined, { shallow: true })
    } catch (error) {
      if (error.reason || error.message) {
        toast.error(!error.reason ? error.message : error.reason)
      }
      console.log('🚀 ~ file: index.js:206 ~ handleConfirmRent ~ error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayRent = async data => {
    try {
      setIsLoading(true)
      const nftContractAddress = data.project.nftAddress
      const tokenId = data.agentLand.tokenId
      const rentAmount = data.rentAmount
      const rentLandInstance = new ethers.Contract(RentLandNFT.address, RentLandNFT.abi, signer)

      let txPayRent

      if (data.currency.isNative) {
        txPayRent = await rentLandInstance.payRent(nftContractAddress, Number(tokenId), {
          value: ethers.utils.parseEther(rentAmount)
        })
        setTxHash(txPayRent.hash)
        txPayRent = await txPayRent.wait()
      } else {
        const ERC20Instance = new ethers.Contract(data.currency.tokenAddress, ERC20Token, signer)
        await (await ERC20Instance.approve(RentLandNFT.address, ethers.constants.MaxInt256)).wait()
        txPayRent = await rentLandInstance.payRent(nftContractAddress, Number(tokenId))
        setTxHash(txPayRent.hash)
        txPayRent = await txPayRent.wait()
      }

      const rentData = {
        token: state.reducer.userData.userData.token.accessToken,
        landId: data.id,
        data: {
          acceptRentTime: new Date().valueOf()
        }
      }

      await dispatch(updateRentLand(rentData))
      router.push('/dashboards/myListing', undefined, { shallow: true })
    } catch (error) {
      if (error.reason || error.message) {
        toast.error(!error.reason ? error.message : error.reason)
      }
      console.log('🚀 ~ file: index.js:206 ~ handleConfirmRent ~ error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayRentBack = async data => {
    try {
      setIsLoading(true)
      const nftContractAddress = data.project.nftAddress
      const tokenId = data.agentLand.tokenId
      const securityAmount = Number(data.securityAmount)
      const rentLandInstance = new ethers.Contract(RentLandNFT.address, RentLandNFT.abi, signer)

      let txPayRent

      if (data.currency.isNative) {
        txPayRent = await rentLandInstance.putBackRent(nftContractAddress, Number(tokenId), {
          value: ethers.utils.parseEther(securityAmount.toString())
        })
        setTxHash(txPayRent.hash)
        txPayRent = await txPayRent.wait()
      } else {
        const ERC20Instance = new ethers.Contract(data.currency.tokenAddress, ERC20Token, signer)
        await (await ERC20Instance.approve(RentLandNFT.address, ethers.constants.MaxInt256)).wait()
        txPayRent = await rentLandInstance.putBackRent(nftContractAddress, Number())
        setTxHash(txPayRent.hash)
        txPayRent = await txPayRent.wait()
      }

      const rentData = {
        token: state.reducer.userData.userData.token.accessToken,
        landId: data.id,
        data: {
          acceptRentTime: null,
          tenantId: null,
          isAcceptByTenant: false,
          currentPaymentTime: null
        }
      }

      await dispatch(updateRentLand(rentData))
      toast.success('Success')
      router.push('/dashboards/myListing', undefined, { shallow: true })
    } catch (error) {
      if (error.reason || error.message) {
        toast.error(!error.reason ? error.message : error.reason)
      }
      console.log('🚀 ~ file: index.js:206 ~ handleConfirmRent ~ error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmRent = async data => {
    try {
      const rentData = {
        token: state.reducer.userData.userData.token.accessToken,
        landId: land,
        data: {
          tenantId: state.reducer.userData.userData.user.id,
          duration: inputDays
        }
      }

      await dispatch(updateRentLand(rentData))
      router.push('/dashboards/marketplace', undefined, { shallow: true })
    } catch (error) {
      console.log('🚀 ~ file: index.js:206 ~ handleConfirmRent ~ error:', error)
    }
  }

  const cancelRequest = async data => {
    try {
      const rentData = {
        token: state.reducer.userData.userData.token.accessToken,
        landId: land,
        data: {
          tenantId: null
        }
      }

      await dispatch(updateRentLand(rentData))
      router.push(`rent-land-detail/?land=${land}`, undefined, { shallow: true })
    } catch (error) {
      console.log('🚀 ~ file: index.js:206 ~ handleConfirmRent ~ error:', error)
    }
  }

  const fetchRentLand = useCallback(async () => {
    try {
      if (land) {
        let response = await fetch(`${BASE_URL_API}/rent/${land}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.reducer.userData.userData.token.accessToken}`
          }
        })
        response = await response.json()
        if (response.status === 200) {
          const currentDate = new Date(response.data.acceptRentTime * 1000)
          const futureDate = new Date(currentDate)
          futureDate.setDate(response.data.duration)

          let upcomingPayment = Number(response.data.lastPaymentTime) + Number(response.data.currentPaymentTime)
          setData(response.data)
          setNextPayment(calculateUnixTimestamp(upcomingPayment))
          setEndRentTime(futureDate.toISOString().split('T')[0])
        }
      }
    } catch (error) {}
  }, [state.reducer.userData.userData.token.accessToken, land])

  useEffect(() => {
    fetchRentLand()
  }, [fetchRentLand, land])

  const calculateUnixTimestamp = numberOfDays => {
    const currentDate = new Date()
    const futureDate = new Date(currentDate)
    futureDate.setDate(currentDate.getDate() + numberOfDays)

    return formatUnixTimestamp(Math.floor(futureDate.getTime() / 1000))
  }

  const formatUnixTimestamp = timestamp => {
    const formattedDate = new Date(timestamp * 1000).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    })

    return formattedDate
  }

  const formatDate = (isoDate, numberOfDays) => {
    const futureDate = new Date(isoDate)
    futureDate.setDate(futureDate.getDate() + numberOfDays)

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    }).format(futureDate)
  }

  return (
    <Container maxWidth='lg' sx={{ marginTop: 4 }}>
      {!data ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      ) : (
        <>
          <Card className={classes.card} onClick={openLightbox}>
            <Grid item xs={12} md={6} style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={data.agentLand.landImage} alt='Land Image' className={classes.image} />
            </Grid>
          </Card>
          {lightboxOpen && (
            <Lightbox
              mainSrc={data.agentLand.landImage[photoIndex]}
              nextSrc={data.agentLand.landImage[(photoIndex + 1) % data.agentLand.landImage.length]}
              prevSrc={
                data.agentLand.landImage[
                  (photoIndex + data.agentLand.landImage.length - 1) % data.agentLand.landImage.length
                ]
              }
              onCloseRequest={closeLightbox}
              onMovePrevRequest={() =>
                setPhotoIndex((photoIndex + data.agentLand.landImage.length - 1) % data.agentLand.landImage.length)
              }
              onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % data.agentLand.landImage.length)}
              animationDuration={50}
            />
          )}
          <Card
            sx={{
              display: 'flex',
              height: '100%',
              borderRadius: 8,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              marginTop: '20px'
            }}
          >
            <Grid container spacing={3} alignItems='center' justifyContent='center'>
              <Grid item xs={12} md={6}>
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    width: '100%'
                  }}
                >
                  <div>
                    <Typography variant='h4' gutterBottom>
                      Property # {data.tokenId}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          Owner Name:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          {data.owner.firstName + ' ' + data.owner.lastName}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          Owner Email:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          {data.owner.email}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          Owner Mobile No:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          {data.owner.phone}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          Owner Wallet:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          <a
                            href={`https://polygonscan.com/address/${data.owner.wallet}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className={classes.link}
                          >
                            {data.owner.wallet.slice(0, 5) +
                              '...' +
                              data.owner.wallet.slice(data.owner.wallet.length - 5, data.owner.wallet.length - 1)}
                          </a>
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider style={{ marginTop: '10px', marginBottom: '15px' }} />

                    {data.isOnchain === true || data.tenantId != null ? (
                      <>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              Tenant Name:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              {data.tenant.firstName + ' ' + data.tenant.lastName}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              Tenant Email:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              {data.tenant.email}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              Tenant Mobile No:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              {data.tenant.phone}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              Tenant Wallet:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              <a
                                href={`https://polygonscan.com/address/${data.tenant.wallet}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className={classes.link}
                              >
                                {data.tenant.wallet.slice(0, 5) +
                                  '...' +
                                  data.tenant.wallet.slice(
                                    data.tenant.wallet.length - 5,
                                    data.tenant.wallet.length - 1
                                  )}
                              </a>
                            </Typography>
                          </Grid>
                        </Grid>
                        <Divider style={{ marginTop: '10px', marginBottom: '15px' }} />
                      </>
                    ) : (
                      ''
                    )}
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          Project Name:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          {data.project.name}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          Project Category:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          {data.project.category.name}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          Project Status:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          {data.project.status}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          NFT Contract Address:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          <a
                            href={`https://polygonscan.com/address/${data.project.nftAddress}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className={classes.link}
                          >
                            {data.project.nftAddress.slice(0, 5) +
                              '...' +
                              data.project.nftAddress.slice(
                                data.project.nftAddress.length - 5,
                                data.project.nftAddress.length - 1
                              )}
                          </a>
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          YouTube Link:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Button onClick={toggleModalVideo} size='large'>
                          <Icon fontSize='1.125rem' icon='vaadin:youtube' />
                        </Button>

                        <Dialog open={isModalOpenVideo} onClose={toggleModalVideo}>
                          <DialogContent>
                            <YouTube videoId={data.agentLand.youtubeLinks} opts={opts} />
                          </DialogContent>
                        </Dialog>
                      </Grid>
                    </Grid>
                    <Divider style={{ marginTop: '10px', marginBottom: '15px' }} />
                    {data.isVacationRent && (
                      <>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              Vacation Land:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              Yes
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              Price:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              {Number(data.duration) * Number(data.rentAmount) + ' ' + data.currency.name}
                            </Typography>
                          </Grid>
                        </Grid>
                      </>
                    )}
                    {data.isListed ? (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant='body1' gutterBottom>
                            Price:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant='body1' gutterBottom>
                            {data.rentAmount + ' ' + data.currency.name}
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      ''
                    )}
                    <Divider style={{ marginTop: '10px', marginBottom: '15px' }} />
                    {data.isVacationRent ? (
                      <>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              Duration
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              {formatDate(data.updatedAt, Number(data.duration))}
                            </Typography>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              Rent is valid till:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              {endRentTime}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              Upcoming Rent at:
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant='body1' gutterBottom>
                              {nextPayment}
                            </Typography>
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </div>
                  <CardActions sx={{ justifyContent: 'center' }}>
                    {!data.tenantId && (
                      <Button onClick={() => handleRent()} variant='outlined' color='primary' maxWidth>
                        Rent this property
                      </Button>
                    )}
                    {data.tenant === null || data.tenant === undefined ? (
                      ''
                    ) : (
                      <>
                        {data.tenant.id === state.reducer.userData.userData.user.id &&
                          data.isOnchain === true &&
                          data.isAcceptByTenant === true && (
                            <>
                              {isLoading ? (
                                <>
                                  <Typography variant='body1' gutterBottom>
                                    {txHash.length > 0 && (
                                      <a
                                        href={`https://polygonscan.com/tx/${txHash}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className={classes.link}
                                      >
                                        {`${txHash.slice(0, 8)}...${txHash.slice(-10, -1)}`}
                                      </a>
                                    )}
                                  </Typography>
                                  <CircularProgress />
                                </>
                              ) : (
                                <Button onClick={() => handlePayRent(data)} variant='outlined' color='primary' maxWidth>
                                  Pay Rent
                                </Button>
                              )}
                            </>
                          )}
                      </>
                    )}
                    {data.tenant === null ? (
                      ''
                    ) : (
                      <>
                        {data.tenant.id === state.reducer.userData.userData.user.id &&
                          data.isOnchain === true &&
                          data.isAcceptByTenant === false && (
                            <>
                              {isLoading ? (
                                <>
                                  <Typography variant='body1' gutterBottom>
                                    {txHash.length > 0 && (
                                      <a
                                        href={`https://polygonscan.com/tx/${txHash}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className={classes.link}
                                      >
                                        {`${txHash.slice(0, 8)}...${txHash.slice(-10, -1)}`}
                                      </a>
                                    )}
                                  </Typography>
                                  <CircularProgress />
                                </>
                              ) : (
                                <Button
                                  onClick={() => handleAcceptRent(data)}
                                  variant='outlined'
                                  color='primary'
                                  maxWidth
                                >
                                  Accept
                                </Button>
                              )}
                            </>
                          )}
                      </>
                    )}
                    {data.owner.id === state.reducer.userData.userData.user.id &&
                      data.isOnchain === true &&
                      data.isAcceptByTenant === true && (
                        <>
                          {isLoading ? (
                            <>
                              <Typography variant='body1' gutterBottom>
                                {txHash.length > 0 && (
                                  <a
                                    href={`https://polygonscan.com/tx/${txHash}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className={classes.link}
                                  >
                                    {`${txHash.slice(0, 8)}...${txHash.slice(-10, -1)}`}
                                  </a>
                                )}
                              </Typography>
                              <CircularProgress />
                            </>
                          ) : (
                            <Button onClick={() => handlePayRentBack(data)} variant='outlined' color='primary' maxWidth>
                              Put Back
                            </Button>
                          )}
                        </>
                      )}
                    {data.tenant === null ? (
                      ''
                    ) : (
                      <>
                        {data.tenant.id !== state.reducer.userData.userData.user.id &&
                          data.isOnchain === false &&
                          data.isAcceptByTenant === false && (
                            <>
                              {isLoading ? (
                                <>
                                  <Typography variant='body1' gutterBottom>
                                    {txHash.length > 0 && (
                                      <a
                                        href={`https://polygonscan.com/tx/${txHash}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className={classes.link}
                                      >
                                        {`${txHash.slice(0, 8)}...${txHash.slice(-10, -1)}`}
                                      </a>
                                    )}
                                  </Typography>
                                  <CircularProgress />
                                </>
                              ) : (
                                <>
                                  <Button
                                    onClick={() => confirmRentLand(data)}
                                    variant='outlined'
                                    color='primary'
                                    maxWidth
                                  >
                                    Accept Request
                                  </Button>
                                  {/* <Button
                                    onClick={() => cancelRequest(data)}
                                    variant='outlined'
                                    color='primary'
                                    maxWidth
                                  >
                                    Cancel
                                  </Button> */}
                                </>
                              )}
                            </>
                          )}
                      </>
                    )}
                    {data.tenant === null ? (
                      ' '
                    ) : (
                      <>
                        {data.tenant.id !== state.reducer.userData.userData.user.id &&
                          data.isOnchain === false &&
                          !data.tenantId && (
                            <Typography variant='body1' gutterBottom>
                              This land is booked for the rent.
                            </Typography>
                          )}
                      </>
                    )}
                  </CardActions>
                </CardContent>
              </Grid>
            </Grid>
          </Card>

          <Dialog open={openDialogRent} onClose={handleCloseDialog}>
            <DialogTitle>Confirm</DialogTitle>
            <DialogContent>
              Are you sure you want to rent this {data?.tokenId} {data?.project?.name} land?
            </DialogContent>
            {data.isVacationRent && (
              <>
                <DialogContent>
                  <TextField
                    label='Days'
                    type='number'
                    value={inputDays}
                    onChange={handleInputDays}
                    fullWidth
                    required
                  />
                </DialogContent>
              </>
            )}
            <DialogActions>
              {isLoading ? (
                <CircularProgress />
              ) : (
                <>
                  <Button onClick={handleCloseDialogRent}>Cancel</Button>
                  <Button onClick={() => handleConfirmRent(data)} color='success'>
                    submit
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  )
}

export default NFTPage
