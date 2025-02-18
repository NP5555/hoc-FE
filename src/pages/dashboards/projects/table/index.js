import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Pagination
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import Spinner from 'src/views/spinner'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-hot-toast'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'
import { deleteProject, addLand, fetchProject } from 'src/store/apps/user'
import { ethers } from 'ethers'
import LandDeveloperSale from '../../../../contract-abis/landDeveloperSale.json'
import LandNFT from '../../../../contract-abis/landNft.json'
import HocToken from '../../../../contract-abis/HOC-Token.json'

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}))

const ProjectTable = () => {
  // State variables
  const [data, setData] = useState([])
  const [type, setType] = useState([])
  const [agent, setAgent] = useState([])
  const [params, setParams] = useState({})
  const [landLoading, setLandLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [blockchainNo, setBlockchainNo] = useState(1)
  const [blockchainMsg, setBlockchainMsg] = useState('')
  const [addLandDialogOpen, setAddLandDialogOpen] = useState(false)
  const [landDeveloper, setLandDeveloper] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState([])
  const [youtubeLinks, setYoutubeLinks] = useState([''])
  const [totalProjectEarnings, setTotalProjectEarnings] = useState([])
  const [earningLoader, setEarningLoader] = useState(false)

  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const classes = useStyles()
  const signer = state?.signer?.signer

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

  // Form validation schema
  const validationSchema = Yup.object().shape({
    startTokenId: Yup.number()
      .required('Start Token Id is required')
      .min(0, 'Start Token Id must be greater than or equal to 0'),
    count: Yup.number().required('Count is required').min(0, 'Count must be greater than or equal to 0'),
    type: Yup.string().required('Type is required'),
    agent: Yup.string().required('Agent is required'),
    plotImage: Yup.string(),
    youtubeLinks: Yup.string()
  })

  const handleAgentChange = e => {
    setParams(prevData => ({
      ...prevData,
      agent: e.target.value
    }))
  }

  const handleTypeChange = e => {
    setParams(prevData => ({
      ...prevData,
      type: e.target.value
    }))
  }

  const handleChange = prop => e => {
    setParams(prevData => ({
      ...prevData,
      [prop]: e.target.value
    }))
  }

  const handleImageChange = async event => {
    try {
      setLandLoading(true)
      setBlockchainMsg('Images are uploading!')

      const selectedFiles = event.target.files
      const newPaths = []

      for (const file of selectedFiles) {
        const result = await client.add(file)
        const path = `https://marketplace-argon.infura-ipfs.io/ipfs/${result.path}`
        newPaths.push(path)
        console.log('🚀 ~ file: index.js:131 ~ handleImageChange ~ path:', path)
      }
      setSelectedImage(newPaths)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLandLoading(false)
      setIsLoading(true)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(validationSchema)
  })

  const handleAddLandMetadata = row => {
    setLandDeveloper(row)
    setAddLandDialogOpen(true)
  }

  const handleAddLandDialogClose = () => {
    setAddLandDialogOpen(false)
    setParams({})
    reset()
    setSelectedImage(null)
  }

  const handleAddYoutubeLink = () => {
    setYoutubeLinks(prevLinks => [...prevLinks, ''])
  }

  const handleYoutubeLinkChange = (index, link) => {
    const updatedLinks = [...youtubeLinks]
    const videoId = getYouTubeVideoId(link)
    updatedLinks[index] = videoId
    setYoutubeLinks(updatedLinks)
  }

  function getYouTubeVideoId(url) {
    const regex = /[?&]v=([^&#]+)/
    const match = url.match(regex)

    return match ? match[1] : null
  }

  const handlePagination = (event, value) => {
    dispatch(
      fetchProject({
        token: state.reducer.userData.userData.token.accessToken,
        page: value,
        take: 10
      })
    )
    setPage(value)
  }

  const handleAddLand = async () => {
    try {
      setLandLoading(true)
      const landSaleInstance = new ethers.Contract(landDeveloper.saleAddress, LandDeveloperSale, signer)
      const NFTInstance = new ethers.Contract(landDeveloper.nftAddress, LandNFT, signer)
      setBlockchainNo(1)
      setBlockchainMsg('Metadata is being added!')

      const tx = await (
        await landSaleInstance.addLandMetadata(
          ethers.utils.parseEther(landDeveloper.price.toString()),
          params.type.blockchainId,
          Number(params.count)
        )
      ).wait()

      setBlockchainNo(2)
      setBlockchainMsg('Installment plan is being added!')

      const months = 10
      const timestampsArray = []
      const currentTime = Math.floor(Date.now() / 1000)
      timestampsArray.push(currentTime)
      for (let i = 1; i < months; i++) {
        const nextTimestamp = currentTime + i * 30 * 24 * 60 * 60
        timestampsArray.push(nextTimestamp)
      }

      const pricePerMonth = Number(landDeveloper.price) / months
      const priceArray = []
      for (let i = 1; i <= months; i++) {
        priceArray.push(ethers.utils.parseEther(pricePerMonth.toFixed(6).toString()))
      }
      await (
        await NFTInstance.updateDefaultInstallmentsByType(
          ethers.utils.parseEther(landDeveloper.price.toString()),
          timestampsArray,
          priceArray,
          params.type.blockchainId
        )
      ).wait()

      if (tx.events) {
        let data = {
          startTokenId: Number(params.startTokenId),
          count: Number(params.count),
          typeId: params.type.id,
          agentId: params.agent,
          projectId: landDeveloper.id,
          developerId: state.reducer.userData.userData.user.id,
          youtubeLinks: youtubeLinks,
          landImage: selectedImage,
          token: state.reducer.userData.userData.token.accessToken
        }
        await dispatch(addLand(data))
      }
    } catch (error) {
      console.log('🚀 ~ file: index.js:133 ~ handleAddLand ~ error:', error)
      toast.error(error.message)
    } finally {
      setLandLoading(false)
      handleAddLandDialogClose()
    }
  }

  const handleDeleteRow = async id => {
    try {
      setIsLoading(true)

      let data = {
        token: state.reducer.userData.userData.token.accessToken,
        id: id
      }

      await dispatch(deleteProject(data))
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const withdrawAmount = async (project, earnings) => {
    try {
      setEarningLoader(true)
      if (earnings.nftCoinBalance > 0) {
        const NFTInstance = new ethers.Contract(project.nftAddress, LandNFT, signer)
        await (await NFTInstance.collectETHs()).wait()
      }
      if (earnings.nftTokenBalance > 0) {
        const NFTInstance = new ethers.Contract(project.nftAddress, LandNFT, signer)
        await (await NFTInstance.collectTokens()).wait()
      }

      if (earnings.saleCoinBalance > 0) {
        const landSaleInstance = new ethers.Contract(project.saleAddress, LandDeveloperSale, signer)
        await (await landSaleInstance.collectETHs()).wait()
      }
      if (earnings.saleTokenBalance > 0) {
        const landSaleInstance = new ethers.Contract(project.saleAddress, LandDeveloperSale, signer)
        await (await landSaleInstance.collectTokens()).wait()
      }
    } catch (error) {
      toast.error(error.reason)
    } finally {
      setEarningLoader(false)
    }
  }

  // Load data from Redux store or show loading/spinner
  useEffect(() => {
    if (
      state.project?.projectData?.data === null ||
      state?.types?.typesData?.data === null ||
      state?.usersRecord?.userData === null
    ) {
      setType([])
    } else if (state.project?.projectData?.data === 'Failed to load data') {
      setType([])
    } else if (state?.types?.typesData?.data === 'Failed to load data' || state?.types?.typesData?.data === null) {
      setType([])
    } else {
      setData(state?.project?.projectData?.data)
      setType(state?.types?.typesData?.data)
      const users = state?.usersRecord?.userData || []
      const filteredUsers = users.filter(user => user.role === 'AGENT')
      setAgent(filteredUsers)
    }
  }, [state.project?.projectData?.data, state?.types?.typesData?.data, state?.usersRecord?.userData])

  useEffect(() => {
    if (data && signer) {
      const getTotalEarnings = async () => {
        let balance = []

        for (const totalProjects of data) {
          let totalTokens
          if (!totalProjects.currency.isNative) {
            const HOCToken = new ethers.Contract(totalProjects.currency?.tokenAddress, HocToken, signer)
            const nftTokenBalance = Number(ethers.utils.formatUnits(await HOCToken.balanceOf(totalProjects.nftAddress)))

            const saleTokenBalance = Number(
              ethers.utils.formatUnits(await HOCToken.balanceOf(totalProjects.saleAddress))
            )
            totalTokens = saleTokenBalance + nftTokenBalance

            const nftCoinBalance = Number(
              ethers.utils.formatUnits(await signer.provider.getBalance(totalProjects.nftAddress))
            )

            const saleCoinBalance = Number(
              ethers.utils.formatUnits(await signer.provider.getBalance(totalProjects.saleAddress))
            )

            const totalCoins = saleCoinBalance + nftCoinBalance

            balance.push({
              nftTokenBalance,
              saleTokenBalance,
              nftCoinBalance,
              saleCoinBalance,
              totalTokens,
              totalCoins
            })
          } else {
            const nftCoinBalance = Number(
              ethers.utils.formatUnits(await signer.provider.getBalance(totalProjects.nftAddress))
            )

            const saleCoinBalance = Number(
              ethers.utils.formatUnits(await signer.provider.getBalance(totalProjects.saleAddress))
            )
            const totalCoins = saleCoinBalance + nftCoinBalance
            console.log('🚀 ~ file: index.js:364 ~ getTotalEarnings ~ totalCoins:', totalCoins)
            console.log({
              nftCoinBalance,
              saleCoinBalance,
              totalCoins
            })
            balance.push({
              nftCoinBalance,
              saleCoinBalance,
              totalCoins
            })
          }
        }
        setTotalProjectEarnings(balance)
      }
      getTotalEarnings()
    }
  }, [data, signer])

  return (
    <>
      {!data || totalProjectEarnings.length === 0 ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      ) : data?.length === 0 && totalProjectEarnings?.length === 0 ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          Record not found
        </Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center'>Project Name</TableCell>
                <TableCell align='center'>NFT Address</TableCell>
                <TableCell align='center'>Sale Address</TableCell>
                <TableCell align='center'>Price</TableCell>
                <TableCell align='center'>Category</TableCell>
                <TableCell align='center'>Status</TableCell>
                <TableCell align='center'>Add Land</TableCell>
                <TableCell align='center'>Total Earnings</TableCell>
                <TableCell align='center'>Withdraw</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice().map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell align='center'>{row.name}</TableCell>
                  <TableCell align='center'>
                    <a
                      href={`https://polygonscan.com/address/${row.nftAddress}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={classes.link}
                    >
                      {row.nftAddress.slice(0, 5) +
                        '...' +
                        row.nftAddress.slice(row.nftAddress.length - 5, row.nftAddress.length - 1)}
                    </a>
                  </TableCell>
                  <TableCell align='center'>
                    <a
                      href={`https://polygonscan.com/address/${row.saleAddress}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={classes.link}
                    >
                      {row.saleAddress.slice(0, 5) +
                        '...' +
                        row.saleAddress.slice(row.saleAddress.length - 5, row.saleAddress.length - 1)}
                    </a>
                  </TableCell>
                  {/* <TableCell align='center'>{row.description}</TableCell> */}
                  <TableCell align='center'>
                    {row.price} {row.currency.name}
                  </TableCell>
                  <TableCell align='center'>{row.category.name}</TableCell>
                  <TableCell align='center'>{row.status}</TableCell>
                  <TableCell align='center'>
                    <Button onClick={() => handleAddLandMetadata(row)} variant='outlined'>
                      <Icon fontSize='1.125rem' icon='carbon:add-filled' />
                    </Button>
                  </TableCell>
                  <TableCell align='center'>
                    {totalProjectEarnings[index].totalCoins >= 0
                      ? `${totalProjectEarnings[index].totalCoins} ${row.currency.name}`
                      : `${totalProjectEarnings[index].totalTokens} ${row.currency.name}`}
                  </TableCell>
                  <TableCell align='center'>
                    {earningLoader ? (
                      <CircularProgress size={20} />
                    ) : (
                      <>
                        {totalProjectEarnings[index].totalCoins === 0 ||
                        totalProjectEarnings[index]?.totalTokens === 0 ? (
                          <Button onClick={() => withdrawAmount(row, earnings)} variant='outlined' disabled>
                            <Icon fontSize='1.125rem' icon='uil:money-withdrawal' />
                          </Button>
                        ) : (
                          <Button onClick={() => withdrawAmount(row, earnings)} variant='outlined'>
                            <Icon fontSize='1.125rem' icon='uil:money-withdrawal' />
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '20px',
              paddingBottom: '20px'
            }}
            count={state.project?.projectData?.meta?.pageCount} // Use the correct property to get the total number of pages
            page={page}
            onChange={handlePagination}
          />
        </>
      )}

      <Dialog open={addLandDialogOpen} onClose={handleAddLandDialogClose}>
        <DialogTitle>Add Land Metadata</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <TextField
              label='First plot No'
              type='number'
              variant='outlined'
              placeholder='100'
              fullWidth
              onChange={handleChange('startTokenId')}
            />
          </FormControl>
        </DialogContent>
        <DialogContent>
          <FormControl fullWidth>
            <TextField
              label='No. of Plots'
              type='number'
              variant='outlined'
              placeholder='100'
              fullWidth
              onChange={handleChange('count')}
            />
          </FormControl>
        </DialogContent>
        <DialogContent>
          {youtubeLinks.map((link, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <Button
                variant='outlined'
                color='primary'
                onClick={handleAddYoutubeLink}
                style={{ marginRight: '10px' }}
                disabled={index !== youtubeLinks.length - 1} // Disable button for all fields except the last one
              >
                {index === youtubeLinks.length - 1 ? '+' : '+'}
              </Button>
              <FormControl fullWidth>
                <TextField
                  label={`Youtube Video Link ${index + 1}`}
                  variant='outlined'
                  placeholder='https://www.youtube.com/watch?v=uYPbbksJxIg'
                  fullWidth
                  value={link}
                  onChange={e => handleYoutubeLinkChange(index, e.target.value)}
                />
              </FormControl>
            </div>
          ))}
        </DialogContent>

        <DialogContent>
          <DialogContentText>
            <input
              accept='image/*'
              type='file'
              id='image-upload'
              onChange={handleImageChange}
              style={{ display: 'none' }}
              multiple // Add the 'multiple' attribute to allow multiple file selection
            />
            {isLoading ? (
              <label htmlFor='image-upload'>
                <Button component='span' variant='outlined' color='primary' disabled fullWidth>
                  Images Uploaded
                </Button>
              </label>
            ) : (
              <label htmlFor='image-upload'>
                <Button component='span' variant='outlined' color='primary' fullWidth>
                  Upload Images
                </Button>
              </label>
            )}
          </DialogContentText>
        </DialogContent>
        {/* {selectedImage.length > 0 && (
          <DialogContent>
            <div className={classes.uploadedImages}>
              {selectedImage.map((image, index) => (
                <span key={index} className={classes.uploadedImage}>
                  {image.name}
                </span>
              ))}
            </div>
          </DialogContent>
        )} */}

        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id='agent-dropdown-label'>Select Agent</InputLabel>
            <Select
              labelId='agent-dropdown-label'
              id='agent-dropdown'
              value={params.agent || ''}
              onChange={handleAgentChange}
              fullWidth
            >
              {agent.map(option => (
                <MenuItem key={option.id} value={option.id}>
                  {option.firstName} {option.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        {!type ? (
          <Spinner />
        ) : (
          <DialogContent>
            <FormControl fullWidth>
              <InputLabel id='type-dropdown-label'>Select Type</InputLabel>
              <Select
                labelId='type-dropdown-label'
                id='type-dropdown'
                value={params.type || ''}
                onChange={handleTypeChange}
                fullWidth
              >
                {type.map(option => (
                  <MenuItem key={option.id} value={option}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
        )}
        <DialogActions>
          {landLoading ? (
            <Button disabled>
              {blockchainMsg} Please wait. {blockchainNo} / 2 <CircularProgress size={18} />
            </Button>
          ) : (
            <>
              <Button onClick={handleAddLandDialogClose}>Cancel</Button>
              <Button type='submit' color='success' onClick={() => handleAddLand(data)}>
                Submit
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProjectTable
