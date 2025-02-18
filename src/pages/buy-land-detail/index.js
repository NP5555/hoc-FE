import React from 'react'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import { BASE_URL_API } from 'src/configs/const'
import HOCMarketplace from '../../contract-abis/HOCMarketplace.json'
import LandNFT from '../../contract-abis/landNft.json'
import LandDeveloperSale from '../../contract-abis/landDeveloperSale.json'

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
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Slider
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import { format } from 'date-fns'

import { useSelector, useDispatch } from 'react-redux'
import YouTube from 'react-youtube'
import Icon from 'src/@core/components/icon'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import { buyLand, updateAgentLand, tradeLand } from 'src/store/apps/user'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'
import HocToken from '../../contract-abis/HOC-Token.json'

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  root: {
    width: '100%'
  },
  installmentCell: {
    width: `${100 / 10}%`,
    textAlign: 'center'
  },
  buttonCell: {
    width: '100%'
  }
}))

const NFTPage = () => {
  const [data, setData] = useState()
  const [isModalOpenVideo, setIsModalOpenVideo] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState()
  const [installmentPlan, setInstallmentPlan] = useState([])

  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const router = useRouter()
  const classes = useStyles()
  const { land, type } = router.query

  const signer = state.signer.signer

  const projectId = '2I1oqhW4ncFv71LUKDOVWWRZ1ZH'
  const projectSecret = 'd8538b15a850ae329e8b348dbbd6311d'
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

  const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth
    }
  })

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

  const handleBuy = async () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleBuyInstallment = async data => {
    setIsLoading(true)

    try {
      let requestData = {
        token: state.reducer.userData.userData.token.accessToken,
        wallet: state.reducer.userData.userData.user.wallet,
        tokenId: data.tokenId,
        typeId: data.typeId,
        agentWallet: data.user.wallet,
        agentLandId: data.id,
        projectId: data.project.id,
        userId: state?.reducer?.userData?.userData?.user?.id,
        updateInstallment: true
      }
      await dispatch(buyLand(requestData))
      router.push('/dashboards/buyLand', undefined, { shallow: true })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
      setOpenDialog(false)
    }
  }

  const handleBuyLand = async data => {
    setIsLoading(true)

    try {
      let requestData = {
        token: state.reducer.userData.userData.token.accessToken,
        wallet: state.reducer.userData.userData.user.wallet,
        tokenId: data.tokenId,
        typeId: data.typeId,
        agentWallet: data.user.wallet,
        agentLandId: data.id,
        projectId: data.project.id,
        userId: state?.reducer?.userData?.userData?.user?.id
      }
      await dispatch(buyLand(requestData))
      router.push('/dashboards/buyLand', undefined, { shallow: true })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
      setOpenDialog(false)
    }
  }

  const handleConfirmBuy = async data => {
    setIsLoading(true)

    try {
      const landSaleInstance = new ethers.Contract(data.project.saleAddress, LandDeveloperSale, signer)

      const _tokenId = Number(data.tokenId)
      const _metadataId = Number(data.type.blockchainId)
      const _signatureTime = Number(data.signatureTime) // Unix timestamp
      const _agent = data.agentWallet
      const _pSignature = data.signatures
      const _updateInstallment = data.updateInstallment
      const _totalInstallments = 0

      const metadata = {
        name:
          data.project.name + ' ' + data.project.category.name + ' ' + data.type.name + ' # ' + data.agentLand.tokenId,
        description: 'This property is managed by the HOC',
        image: data.agentLand.landImage[0],
        attributes: [
          {
            trait_type: 'Token Id',
            value: _tokenId
          },
          {
            trait_type: 'Agent',
            value: _agent
          },
          {
            trait_type: 'Buy on Installments',
            value: _updateInstallment
          }
        ]
      }

      const metadataString = JSON.stringify(metadata)
      const result = await client.add(metadataString)
      const uri = `https://marketplace-argon.infura-ipfs.io/ipfs/${result.path}`

      let tx
      if (data.project.currency.isNative) {
        tx = await (
          await landSaleInstance.buy(
            _tokenId,
            _metadataId,
            _signatureTime,
            _totalInstallments,
            uri,
            _agent,
            _updateInstallment,
            _pSignature,
            {
              value: ethers.utils.parseEther(data.project.price.toString())
            }
          )
        ).wait()
      } else {
        const HOCToken = new ethers.Contract(data.project.currency.tokenAddress, HocToken, signer)
        const maxAllowance = ethers.constants.MaxUint256
        await (await HOCToken.approve(data.project.saleAddress, maxAllowance)).wait()
        tx = await (
          await landSaleInstance.buy(
            _tokenId,
            _metadataId,
            _signatureTime,
            _totalInstallments,
            uri,
            _agent,
            _updateInstallment,
            _pSignature
          )
        ).wait()
      }

      if (tx.events) {
        const isAllInstallmentPaid = true

        let tradeData = {
          token: state.reducer.userData.userData.token.accessToken,
          data: {
            tokenId: data.tokenId,
            userId: state.reducer.userData.userData.user.id,
            typeId: data.type.id,
            agentLandId: data.agentLand.id,
            projectId: data.project.id,
            isAllInstallmentPaid: isAllInstallmentPaid,
            transactionHash: tx.transactionHash,
            tag: 'Mint'
          }
        }

        let agentLand = {
          token: state.reducer.userData.userData.token.accessToken,
          id: data.agentLand.id,
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

  const handlePayFirstInstallment = async data => {
    setIsLoading(true)

    try {
      const landSaleInstance = new ethers.Contract(data.project.saleAddress, LandDeveloperSale, signer)

      const _tokenId = Number(data.agentLand.tokenId)
      const _metadataId = Number(data.type.blockchainId)
      const _signatureTime = Number(data.signatureTime)
      const _agent = data.agentWallet
      const _pSignature = data.signatures
      const _updateInstallment = data.updateInstallment
      const _totalInstallments = 10

      const metadata = {
        name:
          data.project.name + ' ' + data.project.category.name + ' ' + data.type.name + ' # ' + data.agentLand.tokenId,
        description: 'This property is managed by the HOC',
        image: data.agentLand.landImage[0],
        attributes: [
          {
            trait_type: 'Token Id',
            value: _tokenId
          },
          {
            trait_type: 'Agent',
            value: _agent
          },
          {
            trait_type: 'Buy on Installments',
            value: _updateInstallment
          }
        ]
      }

      const metadataString = JSON.stringify(metadata)
      const result = await client.add(metadataString)
      const uri = `https://marketplace-argon.infura-ipfs.io/ipfs/${result.path}`
      let tx
      let commission = await landSaleInstance.agentCommission()
      let price = Number(data.project.price)
      price = price / _totalInstallments
      let agentCommission = (Number(data.project.price) * Number(commission)) / 100
      price = (price + agentCommission + 0.00009).toFixed(6)

      if (data.project.currency.isNative) {
        tx = await (
          await landSaleInstance.buy(
            _tokenId,
            _metadataId,
            _signatureTime,
            _totalInstallments,
            uri,
            _agent,
            _updateInstallment,
            _pSignature,
            {
              value: ethers.utils.parseEther(price.toString())
            }
          )
        ).wait()
      } else {
        const HOCToken = new ethers.Contract(data.project.currency.tokenAddress, HocToken, signer)

        const maxAllowance = ethers.constants.MaxUint256

        await (await HOCToken.approve(data.project.saleAddress, maxAllowance)).wait()

        tx = await (
          await landSaleInstance.buy(
            _tokenId,
            _metadataId,
            _signatureTime,
            _totalInstallments,
            uri,
            _agent,
            _updateInstallment,
            _pSignature
          )
        ).wait()
      }

      if (tx.events) {
        let tradeData = {
          token: state.reducer.userData.userData.token.accessToken,
          data: {
            tokenId: data.tokenId,
            userId: state.reducer.userData.userData.user.id,
            typeId: data.type.id,
            agentLandId: data.agentLand.id,
            projectId: data.project.id,
            isAllInstallmentPaid: false,
            transactionHash: tx.transactionHash,
            tag: 'Mint'
          }
        }

        let agentLand = {
          token: state.reducer.userData.userData.token.accessToken,
          id: data.agentLand.id,
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

  const handlePayInstallment = async (row, index) => {
    try {
      const NFTInstance = new ethers.Contract(data.project.nftAddress, LandNFT, signer)

      let tx
      if (data.project.currency.isNative) {
        tx = await (
          await NFTInstance.payInstallment(index, Number(data.tokenId), {
            value: row.amount
          })
        ).wait()
      } else {
        const HOCToken = new ethers.Contract(data.project.currency.tokenAddress, HocToken, signer)

        const maxAllowance = ethers.constants.MaxUint256

        await (await HOCToken.approve(data.project.saleAddress, maxAllowance)).wait()

        tx = await (await NFTInstance.payInstallment(index, Number(data.tokenId))).wait()
      }
    } catch (error) {
      toast.error(error.reason)
      console.log('🚀 ~ file: index.js:139 ~ handlePayInstallment ~ error:', error)
    }
  }

  const handleInputChange = event => {
    setInputValue(event.target.value)
  }

  const fetchLand = useCallback(async () => {
    try {
      if (land) {
        let response = await fetch(`${BASE_URL_API}/agent-land/${land}`, {
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

  const fetchOwnLand = useCallback(async () => {
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

  const fetchBuyLand = useCallback(async () => {
    try {
      if (land) {
        let response = await fetch(`${BASE_URL_API}/buy/${land}`, {
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

  useEffect(() => {
    if (type === 'buy-land') {
      fetchBuyLand()
    } else if (type === 'own-land') {
      fetchOwnLand()
    } else {
      fetchLand()
    }
  }, [land])

  const getDefaultInstallmentByType = async () => {
    try {
      if (data) {
        const NFTInstance = new ethers.Contract(data.project.nftAddress, LandNFT, signer)
        const getInstallmentPlan = await NFTInstance.getDefaultInstallmentsByType(1, 50, data.type.blockchainId)
        setInstallmentPlan(getInstallmentPlan[0])
      }
    } catch (error) {
      console.log('🚀 ~ file: index.js:162 ~ getDefaultInstallmentByType ~ error:', error)
    }
  }
  useEffect(() => {
    getDefaultInstallmentByType()
  }, [data])

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = type === 'buy-land' || type === 'own-land' ? data?.agentLand?.landImage : data?.landImage

  const handleSliderChange = (event, newValue) => {
    setCurrentImageIndex(newValue)
  }

  return (
    <Container maxWidth='lg' sx={{ marginTop: 4 }}>
      {!data ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      ) : (
        <>
          <Card sx={{ display: 'flex', height: '100%', borderRadius: 8, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <Grid container spacing={3} justifyContent='center'>
              {images.length > 0 && images && (
                <Grid item xs={12} md={6}>
                  <img
                    src={images[currentImageIndex]}
                    alt={`Land Image ${currentImageIndex}`}
                    style={{ width: '100%', height: 'auto', borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}
                  />
                  <Slider value={currentImageIndex} onChange={handleSliderChange} max={images.length - 1} step={1} />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <CardContent
                  sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
                >
                  <div>
                    <Typography variant='h4' gutterBottom>
                      Property # : {data.tokenId}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='body1' gutterBottom>
                          Agent Name:
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
                          Agent Email:
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
                          Agent Mobile No:
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
                          Agent Wallet:
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
                      {!data.youtubeLinks ? (
                        ' '
                      ) : (
                        <>
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
                                <YouTube videoId={data.youtubeLinks} opts={opts} />
                              </DialogContent>
                            </Dialog>
                          </Grid>
                        </>
                      )}
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

                  {data?.status === 'IN_PROCESS' ||
                  (data?.agentLand?.status === 'IN_PROCESS' && data?.updateInstallment === true) ? (
                    <>
                      {isLoading ? (
                        <CircularProgress maxWidth />
                      ) : (
                        <Button
                          onClick={() => handlePayFirstInstallment(data)}
                          variant='outlined'
                          color='primary'
                          maxWidth
                        >
                          Pay Down Payment
                        </Button>
                      )}
                    </>
                  ) : data?.updateInstallment === false && data?.isSigned ? (
                    <>
                      {isLoading ? (
                        <CircularProgress maxWidth />
                      ) : (
                        <Button onClick={() => handleConfirmBuy(data)} variant='outlined' color='primary' maxWidth>
                          Confirm Buy
                        </Button>
                      )}
                    </>
                  ) : data?.status === 'SOLD' || data?.agentLand?.status === 'SOLD' ? (
                    ''
                  ) : (
                    <CardActions sx={{ justifyContent: 'center' }}>
                      {isLoading ? (
                        <CircularProgress />
                      ) : (
                        <>
                          <Button onClick={() => handleBuy()} variant='outlined' color='primary' maxWidth>
                            Buy Now
                          </Button>
                          <Button
                            onClick={() => handleBuyInstallment(data)}
                            variant='outlined'
                            color='primary'
                            maxWidth
                          >
                            Buy on Installment
                          </Button>
                        </>
                      )}
                    </CardActions>
                  )}
                </CardContent>
              </Grid>
            </Grid>
          </Card>

          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Confirm</DialogTitle>
            <DialogContent>Are you sure you want to buy this {data?.tokenId} land?</DialogContent>
            <DialogActions>
              {isLoading ? (
                <CircularProgress />
              ) : (
                <>
                  <Button onClick={handleCloseDialog}>Cancel</Button>
                  <Button onClick={() => handleBuyLand(data)} color='success'>
                    Buy
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>
          {data.isAllInstallmentPaid ? (
            ''
          ) : (
            <>
              <Typography align='center' variant='h3' padding={4}>
                Installment Plan
              </Typography>
              <TableContainer
                component={Paper}
                sx={{ display: 'flex', height: '100%', borderRadius: 8, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
              >
                <Table aria-label='Installment Table'>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center'>Installment Plan</TableCell>
                      <TableCell align='center'>Price</TableCell>
                      <TableCell align='center'>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {!installmentPlan || installmentPlan.length === 0 ? (
                        <Typography align='center' variant='body1' gutterBottom>
                          No record Found
                        </Typography>
                      ) : (
                        <>
                          <TableCell align='center'>{installmentPlan.length} Months</TableCell>
                          <TableCell align='center'>
                            {ethers.utils.formatUnits(installmentPlan[0]?.amount.toString(), 18)} / Month
                          </TableCell>
                          <TableCell align='center'>Default </TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
          {data.status === 'UNSOLD' || data.updateInstallment === false ? null : (
            <>
              <Typography align='center' variant='h5' padding={4}>
                Installment Status
              </Typography>
              <TableContainer
                component={Paper}
                sx={{ display: 'flex', height: '100%', borderRadius: 8, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
              >
                <Table aria-label='Installment Table'>
                  <TableHead>
                    <TableRow>
                      {installmentPlan.map((row, index) => (
                        <TableCell key={index} align='center'>
                          Installment {index + 1}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {installmentPlan.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={installmentPlan.length + 1} align='center'>
                          <Typography variant='body1' gutterBottom>
                            No record Found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        <TableRow>
                          {installmentPlan.map((row, index) => (
                            <TableCell key={index} align='center'>
                              {ethers.utils.formatUnits(row.amount.toString(), 18)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          {installmentPlan.map((row, index) => (
                            <TableCell key={index} align='center'>
                              {format(new Date(row.dueDate * 1000), 'yyyy-MM-dd HH:mm:ss')}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          {installmentPlan.map((row, index) => (
                            <TableCell key={index} align='center'>
                              {row.isSold ? (
                                <Button sx={{ borderRadius: 8 }} variant='outlined' color='primary' disabled>
                                  Paid
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handlePayInstallment(row, index)}
                                  sx={{ borderRadius: 8 }}
                                  variant='outlined'
                                  color='primary'
                                >
                                  Pay
                                </Button>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </>
      )}
    </Container>
  )
}

export default NFTPage
