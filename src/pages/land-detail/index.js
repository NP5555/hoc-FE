import React from 'react'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import { BASE_URL_API } from 'src/configs/const'
import HOCMarketplace from '../../contract-abis/HOCMarketplace.json'
import LandNFT from '../../contract-abis/landNft.json'

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
  TextField,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { makeStyles } from 'src/utils/makeStyles'

import { useSelector, useDispatch } from 'react-redux'
import YouTube from 'react-youtube'
import Icon from 'src/@core/components/icon'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import { updateBuyLand, updateProject, updateTradeLand, rentLand } from 'src/store/apps/user'

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}))

const NFTPage = () => {
  const [data, setData] = useState()
  const [isModalOpenVideo, setIsModalOpenVideo] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDialogRent, setOpenDialogRent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState()
  const [currency, setCurrency] = useState()
  const [inputValueSecurity, setInputValueSecurity] = useState()
  const [inputValueDuration, setInputValueDuration] = useState()
  const [inputValuePaymentTime, setInputValuePaymentTime] = useState()
  const [inputValueCurrency, setInputValueCurrency] = useState()
  const [isVacationRent, setIsVacationRent] = useState()
  const [priceLabel, setPriceLabel] = useState('Price')

  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const router = useRouter()
  const classes = useStyles()
  const { land } = router.query
  const signer = state.signer.signer

  const toggleModalVideo = () => {
    setIsModalOpenVideo(!isModalOpenVideo)
  }

  const opts = {
    height: '400px',
    width: '450px'
  }

  const handleSell = async () => {
    setOpenDialog(true)
  }

  const handleRent = async () => {
    setOpenDialogRent(true)
  }

  const handleBuy = async () => {
    setOpenDialog(true)
  }

  const handleSignTransaction = async () => {
    try {
      const signingDomain = async () => {
        const domain = {
          name: 'Marketplace',
          version: '1.0.0',
          verifyingContract: HOCMarketplace?.address,
          chainId: 56
        }

        return domain
      }

      const domain = await signingDomain()

      const types = {
        Marketplace: [
          { name: 'landId', type: 'uint256' },
          { name: 'landAddress', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'timeStamp', type: 'uint256' }
        ]
      }

      const landId = Number(data.agentLand.tokenId)
      const landAddress = data.project.nftAddress
      const timeStamp = Math.floor(Date.now() / 1000)

      const message = {
        landId: landId,
        landAddress: landAddress,
        price: ethers.utils.parseEther(data.price),
        timeStamp
      }
      const signature = await signer._signTypedData(domain, types, message)
      if (signature) {
        const data = {
          token: state.reducer.userData.userData.token.accessToken,
          landId: land,
          data: {
            signatures: signature,
            signatureTime: timeStamp
          }
        }

        await dispatch(updateTradeLand(data))
      }
    } catch (error) {}
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleCloseDialogRent = () => {
    setOpenDialogRent(false)
  }

  const handleConfirmSell = async data => {
    try {
      setIsLoading(true)
      if (!inputValue) {
        toast.error('Please enter the price')

        return
      }

      const NFTInstance = new ethers.Contract(data.project.nftAddress, LandNFT, signer)
      const marketplaceInstance = new ethers.Contract(HOCMarketplace.address, HOCMarketplace.abi, signer)

      const txApproveNFT = await (await NFTInstance.setApprovalForAll(HOCMarketplace.address, true)).wait()

      const txListing = await (
        await marketplaceInstance.listLand(
          data.project.nftAddress,
          Number(data.agentLand.tokenId),
          ethers.utils.parseEther(inputValue.toString())
        )
      ).wait()
      if (txListing.events) {
        let params = {
          token: state.reducer.userData.userData.token.accessToken,
          landId: land,
          data: {
            isListed: true,
            price: inputValue.toString(),
            transactionHash: txListing.transactionHash,
            tag: 'List'
          }
        }
        await dispatch(updateTradeLand(params))
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
      setOpenDialog(false)
    }
  }

  const handleConfirmRent = async data => {
    console.log('🚀 ~ file: index.js:192 ~ handleConfirmRent ~ data:', data)
    if (!isVacationRent) {
      if (!inputValue || !inputValueSecurity || !inputValueDuration || !inputValuePaymentTime) {
        handleCloseDialogRent()
        toast.error('Please fill all fields')

        return null
      }
    } else if (isVacationRent) {
      if (!inputValue || !inputValueDuration) {
        handleCloseDialogRent()
        toast.error('Please fill all fields')

        return null
      }
    }
    try {
      const rentData = {
        token: state.reducer.userData.userData.token.accessToken,
        data: {
          tokenId: data.agentLand.tokenId,
          rentAmount: inputValue,
          securityAmount: isVacationRent ? 0 : inputValueSecurity,
          isAcceptByTenant: false,
          requestForBack: false,
          currencyId: inputValueCurrency,
          lastPaymentTime: isVacationRent ? 0 : inputValuePaymentTime,
          duration: inputValueDuration,
          ownerId: state.reducer.userData.userData.user.id,
          projectId: data.project.id,
          agentLandId: data.agentLand.id,
          isOnchain: false,
          isVacationRent: isVacationRent
        }
      }
      await dispatch(rentLand(rentData))
      router.push('/dashboards/marketplace', undefined, { shallow: true })
    } catch (error) {
      console.log('🚀 ~ file: index.js:206 ~ handleConfirmRent ~ error:', error)
    }
  }

  const handleBuyNFT = async data => {
    try {
      setIsLoading(true)

      const marketplaceInstance = new ethers.Contract(HOCMarketplace.address, HOCMarketplace.abi, signer)

      const txListing = await (
        await marketplaceInstance.sellLand(
          Number(data.agentLand.tokenId),
          data.project.nftAddress,
          ethers.utils.parseEther(data.price),
          Number(data.signatureTime),
          data.signatures
        )
      ).wait()

      if (txListing.events) {
        let params = {
          token: state.reducer.userData.userData.token.accessToken,
          landId: land,
          data: {
            isSold: true,
            isTradeInitiated: false,
            isListed: false,
            userId: state.reducer.userData.userData.user.id,
            transactionHash: txListing.transactionHash,
            tag: 'Buy'
          }
        }
        await dispatch(updateTradeLand(params))
      }
    } catch (error) {
      console.log('🚀 ~ file: index.js:201 ~ handleBuyNFT ~ error:', error)
      if (error.reason) {
        toast.error(error.reason)
      } else {
        toast.error(error.message)
      }
    } finally {
      setIsLoading(false)
      setOpenDialog(false)
    }
  }

  const handleConfirmBuy = async data => {
    try {
      setIsLoading(true)
      const marketplaceInstance = new ethers.Contract(HOCMarketplace.address, HOCMarketplace.abi, signer)

      const txListing = await (
        await marketplaceInstance.initiateTrade(data.project.nftAddress, Number(data.agentLand.tokenId), {
          value: ethers.utils.parseEther(data.price)
        })
      ).wait()
      if (txListing.events) {
        let params = {
          token: state.reducer.userData.userData.token.accessToken,
          landId: land,
          data: {
            buyerId: state.reducer.userData.userData.user.id,
            isTradeInitiated: true
          }
        }
        await dispatch(updateTradeLand(params))
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
      setOpenDialog(false)
    }
  }

  const handleDelist = async () => {
    setIsLoading(true)

    let params = {
      token: state.reducer.userData.userData.token.accessToken,
      id: land,
      data: {
        isListed: false,
        price: '0.00'
      }
    }
    try {
      await dispatch(updateBuyLand(params))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
      setOpenDialog(false)
    }
  }

  const handleInputChange = event => {
    setInputValue(event.target.value)
  }

  const handleInputSecurityChange = event => {
    setInputValueSecurity(event.target.value)
  }

  const handleInputDurationChange = event => {
    setInputValueDuration(event.target.value)
  }

  const handleInputPaymentTimeChange = event => {
    setInputValuePaymentTime(event.target.value)
  }

  const handleInputCurrencyChange = event => {
    setInputValueCurrency(event.target.value)
  }

  const handleVacationRent = event => {
    setPriceLabel('Price per Day')
    if (isVacationRent === true) {
      setPriceLabel('Price')
    }
    setIsVacationRent(!isVacationRent)
  }

  const fetchLand = useCallback(async () => {
    try {
      if (land) {
        let response = await fetch(`${BASE_URL_API}/trade/${land}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.reducer.userData.userData.token.accessToken}`
          }
        })
        response = await response.json()
        if (response.status === 200) {
          setData(response.data)
        }
      }
    } catch (error) {}
  }, [state.reducer.userData.userData.token.accessToken, land])

  const fetchCurrency = useCallback(async () => {
    try {
      let response = await fetch(`${BASE_URL_API}/Currency?page=1&take=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.reducer.userData.userData.token.accessToken}`
        }
      })
      response = await response.json()
      if (response.status === 200) {
        setCurrency(response.data.data)
      }
    } catch (error) {}
  }, [state.reducer.userData.userData.token.accessToken, currency])

  useEffect(() => {
    fetchLand()
  }, [fetchLand, land])

  useEffect(() => {
    fetchCurrency()
  }, [land])

  return (
    <Container maxWidth='lg' sx={{ marginTop: 4 }}>
      {!data ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      ) : (
        <>
          <Card sx={{ display: 'flex', height: '100%', borderRadius: 8, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <img
                  src={data.agentLand.landImage}
                  alt='Land Image'
                  style={{ width: '100%', height: 'auto', borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CardContent
                  sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
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
                          {data.user.firstName + ' ' + data.user.lastName}
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
                          {data.user.email}
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
                          {data.user.phone}
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
                            href={`https://polygonscan.com/address/${data.user.wallet}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className={classes.link}
                          >
                            {data.user.wallet.slice(0, 5) +
                              '...' +
                              data.user.wallet.slice(data.user.wallet.length - 5, data.user.wallet.length - 1)}
                          </a>
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider style={{ marginTop: '10px', marginBottom: '15px' }} />
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
                          Project Type:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          {data.type.name}
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
                          Plot Type:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          {data.type.name}
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
                    {data.isListed ? (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant='body1' gutterBottom>
                            Price:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant='body1' gutterBottom>
                            {data.price + ' ' + data.project.currency.name}
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      ''
                    )}
                  </div>

                  {isLoading ? (
                    <>
                      <CircularProgress />
                    </>
                  ) : (
                    <>
                      {data.isListed &&
                      state.reducer.userData.userData.user.id !== data?.user?.id &&
                      !data.isTradeInitiated ? (
                        <CardActions sx={{ justifyContent: 'center' }}>
                          <Button onClick={() => handleBuy()} variant='outlined' color='primary' maxWidth>
                            Buy Now
                          </Button>
                        </CardActions>
                      ) : data.isTradeInitiated && state.reducer.userData.userData.user.id === data?.user?.id ? (
                        <CardActions sx={{ justifyContent: 'center' }}>
                          <Button onClick={() => handleSignTransaction()} variant='outlined' color='primary' maxWidth>
                            Sign Transaction
                          </Button>
                        </CardActions>
                      ) : data.isTradeInitiated && state.reducer.userData.userData.user.id === data?.buyerId ? (
                        <CardActions sx={{ justifyContent: 'center' }}>
                          <Button onClick={() => handleBuyNFT(data)} variant='outlined' color='primary' maxWidth>
                            Confirm Buy
                          </Button>
                        </CardActions>
                      ) : data.isListed && state.reducer.userData.userData.user.id === data?.user?.id ? (
                        ''
                      ) : (
                        <CardActions sx={{ justifyContent: 'center' }}>
                          <Button onClick={() => handleSell()} variant='outlined' color='primary' maxWidth>
                            Sell Now
                          </Button>
                          <Button onClick={() => handleRent()} variant='outlined' color='primary' maxWidth>
                            Rent Out
                          </Button>
                        </CardActions>
                      )}
                    </>
                  )}
                </CardContent>
              </Grid>
            </Grid>
          </Card>

          {data.isListed && state.reducer.userData.userData.user.id !== data?.user?.id ? (
            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Confirm</DialogTitle>
              <DialogContent>Are you sure you want to buy this {data?.tokenId} land?</DialogContent>
              <DialogActions>
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  <>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={() => handleConfirmBuy(data)} color='success'>
                      Buy
                    </Button>
                  </>
                )}
              </DialogActions>
            </Dialog>
          ) : (
            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Confirm</DialogTitle>
              <DialogContent>
                <TextField
                  label='Price'
                  type='number'
                  value={inputValue}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </DialogContent>
              <DialogContent>Are you sure you want to sell this {data?.tokenId} land?</DialogContent>
              <DialogActions>
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  <>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={() => handleConfirmSell(data)} color='success'>
                      Sell
                    </Button>
                  </>
                )}
              </DialogActions>
            </Dialog>
          )}
          <Dialog open={openDialogRent} onClose={handleCloseDialog}>
            <DialogTitle>Confirm</DialogTitle>
            <DialogContent>Are you sure you want to list this {data?.tokenId} land for rent?</DialogContent>
            <DialogContent>
              <TextField
                label='Duration in Days'
                type='number'
                value={inputValueDuration}
                onChange={handleInputDurationChange}
                fullWidth
                required
              />
            </DialogContent>
            <DialogContent>
              <FormControlLabel
                control={<Checkbox checked={isVacationRent} onChange={handleVacationRent} color='primary' />}
                label='Vacation Rent'
              />
            </DialogContent>
            <DialogContent>
              {/* Rent in Days input, conditionally disabled if Vacation Rent checkbox is selected */}
              <TextField
                label='Rent in Days'
                type='number'
                value={inputValuePaymentTime}
                onChange={handleInputPaymentTimeChange}
                fullWidth
                required
                disabled={isVacationRent}
              />
            </DialogContent>
            <DialogContent>
              <TextField
                label={priceLabel}
                type='number'
                value={inputValue}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </DialogContent>
            <DialogContent>
              <TextField
                label='Security'
                type='number'
                value={inputValueSecurity}
                onChange={handleInputSecurityChange}
                fullWidth
                required
                disabled={isVacationRent}
              />
            </DialogContent>
            <DialogContent>
              <InputLabel id='currency-label'>Currency</InputLabel>
              <Select
                labelId='currency-label'
                id='currency'
                value={inputValueCurrency}
                onChange={handleInputCurrencyChange}
                fullWidth
                required
              >
                {currency ? (
                  currency.map(currencyItem => (
                    <MenuItem key={currencyItem.id} value={currencyItem.id}>
                      {currencyItem.name}
                    </MenuItem>
                  ))
                ) : (
                  <CircularProgress />
                )}
              </Select>
            </DialogContent>
            <DialogActions>
              {isLoading ? (
                <CircularProgress />
              ) : (
                <>
                  <Button onClick={handleCloseDialogRent}>Cancel</Button>
                  <Button onClick={() => handleConfirmRent(data)} color='success'>
                    Submit
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
