import { useState, useEffect } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Spinner from 'src/views/spinner'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { addProject, fetchCategory, fetchCurrency, fetchUser } from 'src/store/apps/user'
import { CircularProgress, Divider } from '@mui/material'

// ** Smart Contract
import { ethers } from 'ethers'
import LandNftFactory from '../../../../contract-abis/landNftFactory.json'
import LandSaleFactory from '../../../../contract-abis/landSaleFactory.json'
import LandDeveloperSale from '../../../../contract-abis/landDeveloperSale.json'
import LandNFT from '../../../../contract-abis/landNft.json'
import { toast } from 'react-hot-toast'

const showErrors = (field, valueLen, min) => {
  if (valueLen === 0) {
    return `${field} field is required`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`
  } else {
    return ''
  }
}

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const schema = yup.object().shape({
  landName: yup
    .string()
    .min(3, obj => showErrors('Project Name', obj.value.length, obj.min))
    .required(),
  symbol: yup
    .string()
    .min(1, obj => showErrors('Symbol', obj.value.length, obj.min))
    .required(),
  commission: yup
    .number()
    .min(1, obj => showErrors('Commission', obj.value.length, obj.min))
    .required(),
  category: yup
    .string()
    .min(3, obj => showErrors('Category', obj.value.length, obj.min))
    .required(),
  currency: yup
    .string()
    .min(3, obj => showErrors('Currency', obj.value.length, obj.min))
    .required(),
  price: yup
    .number()
    .min(-1, obj => showErrors('Price', obj.value.length, obj.min))
    .required(),
  penalty: yup
    .number()
    .min(1, obj => showErrors('penalty Percentage', obj.value.length, obj.min))
    .required()
})

const defaultValues = {
  landName: null,
  symbol: null,
  commission: null,
  penalty: null,
  category: null,
  currency: null,
  price: null
}

const SidebarAddProject = props => {
  // ** Props
  const { open, toggle } = props

  // ** State
  const [isLoading, setIsLoading] = useState(false)
  const [bFunctionNo, setBFunctionNo] = useState(1)
  const [bFunctionName, setBFunctionName] = useState('')
  const [agentsData, setAgentsData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [currencyData, setCurrencyData] = useState([])

  // ** Hooks
  const dispatch = useDispatch()

  const state = useSelector(state => state)
  const users = state.usersRecord.userData
  const signer = state.signer.signer

  const loadData = () => {
    if (!state?.category?.categoryData) {
      setCategoryData(null)
    } else if (
      state?.category?.categoryData === 'Failed to load data' ||
      state?.category?.categoryData === 'Record not found'
    ) {
      setCategoryData(null)
    } else {
      setCategoryData(state?.category?.categoryData?.data)
    }

    if (!state?.currency?.currencyData) {
      setCurrencyData(null)
    } else if (
      state?.currency?.currencyData === 'Failed to load data' ||
      state?.currency?.currencyData === 'Record not found'
    ) {
      setCurrencyData(null)
    } else {
      setCurrencyData(state?.currency?.currencyData?.data)
    }
  }

  useEffect(() => {
    loadData()
  }, [state?.category?.categoryData, state?.currency?.currencyData])

  const getAgents = () => {
    const users = state?.usersRecord?.userData || []
    const filteredUsers = users.filter(user => user.role === 'AGENT')
    setAgentsData(filteredUsers)
  }

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    try {
      setIsLoading(true)
      const currency = currencyData.find(currency => currency.id === data.currency)

      const landNFTInstance = new ethers.Contract(LandNftFactory.address, LandNftFactory.abi, signer)
      const landSaleInstance = new ethers.Contract(LandSaleFactory.address, LandSaleFactory.abi, signer)
      const token = currency.isNative ? ethers.constants.AddressZero : currency.tokenAddress

      setBFunctionNo(1)
      setBFunctionName('Deploying Land NFT')
      let nftFactoryTx
      let saleFactoryTx

      nftFactoryTx = await (
        await landNFTInstance.createLandNFT(data.landName, data.symbol, data.penalty, currency.isNative, token)
      ).wait()

      setBFunctionNo(2)
      setBFunctionName('Deploying Land Sale')

      saleFactoryTx = await (
        await landSaleInstance.createDeveloperSale(
          data.commission,
          2629632,
          nftFactoryTx.events[6].args.newLandNFTContract,
          currency.isNative,
          token
        )
      ).wait()

      if (nftFactoryTx.events) {
        setBFunctionNo(2)
        setBFunctionName('Deploying Land Sale')

        const NFTInstance = new ethers.Contract(nftFactoryTx.events[6].args.newLandNFTContract, LandNFT, signer)
        const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE'))

        setBFunctionNo(3)
        setBFunctionName('Granting role to Land NFT')

        await (
          await NFTInstance.grantRole(MINTER_ROLE, saleFactoryTx.events[4].args.newLandDeveloperSaleContract)
        ).wait()

        if (saleFactoryTx.events) {
          let params = {
            token: state.reducer.userData.userData.token.accessToken,
            name: data.landName,
            price: data.price,
            description: 'Description',
            saleAddress: saleFactoryTx.events[4].args.newLandDeveloperSaleContract,
            nftAddress: nftFactoryTx.events[6].args.newLandNFTContract,
            categoryId: data.category,
            currencyId: currency.id,
            developerId: state.reducer.userData.userData.user.id
          }

          dispatch(addProject(params))
        }
      }
    } catch (error) {
      console.log('🚀 ~ file: AddProjectDrawer.js:275 ~ onSubmit ~ error:', error)
      toast.error(error.reason)
    } finally {
      reset()
      setIsLoading(false)
      toggle()
    }
  }

  const handleClose = () => {
    reset()
    toggle()
  }

  useEffect(() => {
    dispatch(
      fetchCategory({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10
      })
    )

    getAgents()
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  useEffect(() => {
    dispatch(
      fetchCurrency({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h6'>Add Project</Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{ borderRadius: 1, color: 'text.primary', backgroundColor: 'action.selected' }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>
      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='landName'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Project Name'
                  onChange={onChange}
                  placeholder='Project Name'
                  error={Boolean(errors.landName)}
                />
              )}
            />
            {errors.landName && <FormHelperText sx={{ color: 'error.main' }}>{errors.landName.message}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='symbol'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Symbol'
                  onChange={onChange}
                  placeholder='ABCD'
                  error={Boolean(errors.symbol)}
                />
              )}
            />
            {errors.symbol && <FormHelperText sx={{ color: 'error.main' }}>{errors.symbol.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='commission'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  type='number'
                  label='Agent Commission'
                  onChange={onChange}
                  placeholder='2%'
                  error={Boolean(errors.commission)}
                />
              )}
            />
            {errors.commission && (
              <FormHelperText sx={{ color: 'error.main' }}>{errors.commission.message}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='penalty'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  type='number'
                  label='Penalty Percentage'
                  onChange={onChange}
                  placeholder='2%'
                  error={Boolean(errors.penalty)}
                />
              )}
            />
            {errors.penalty && <FormHelperText sx={{ color: 'error.main' }}>{errors.penalty.message}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel id='category-label'>Category</InputLabel>
            <Controller
              name='category'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select labelId='category-label' value={value} onChange={onChange} error={Boolean(errors.category)}>
                  {!categoryData ? (
                    <Spinner />
                  ) : (
                    categoryData.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
            {errors.category && <FormHelperText sx={{ color: 'error.main' }}>{errors.category.message}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel id='currency-label'>Currency</InputLabel>
            <Controller
              name='currency'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select labelId='currency-label' value={value} onChange={onChange} error={Boolean(errors.currency)}>
                  {!currencyData ? (
                    <Spinner />
                  ) : (
                    currencyData.map(currency => (
                      <MenuItem key={currency.id} value={currency.id}>
                        {currency.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
            {errors.currency && <FormHelperText sx={{ color: 'error.main' }}>{errors.currency.message}</FormHelperText>}
          </FormControl>
          <Divider />
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='price'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Price'
                  onChange={onChange}
                  placeholder='10000'
                  error={Boolean(errors.price)}
                />
              )}
            />
            {errors.price && <FormHelperText sx={{ color: 'error.main' }}>{errors.price.message}</FormHelperText>}
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CircularProgress />
                <Typography variant='h8'>
                  {bFunctionName}! Please wait. {bFunctionNo}/3
                </Typography>
              </Box>
            ) : (
              <>
                <Button type='submit' variant='contained' sx={{ mr: 3 }} disabled={isLoading}>
                  Submit
                </Button>
                <Button variant='outlined' color='secondary' onClick={handleClose}>
                  Cancel
                </Button>
              </>
            )}
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default SidebarAddProject
