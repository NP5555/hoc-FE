// ** React Imports
import { useEffect, useState } from 'react'

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
import { CircularProgress } from '@mui/material'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { addType, fetchProject } from 'src/store/apps/user'
import { toast } from 'react-hot-toast'
import { BASE_URL_API } from 'src/configs/const'
import project from 'src/store/apps/project'
import { MuiTelInput } from 'mui-tel-input'

import LandNftFactory from '../../../../contract-abis/landNftFactory.json'
import LandSaleFactory from '../../../../contract-abis/landSaleFactory.json'
import { ethers } from 'ethers'

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
  firstName: yup
    .string()
    .min(3, obj => showErrors('First Name', obj.value.length, obj.min))
    .required(),
  firstName: yup
    .string()
    .min(3, obj => showErrors('Last Name', obj.value.length, obj.min))
    .required(),
  email: yup
    .string()
    .min(3, obj => showErrors('Email', obj.value.length, obj.min))
    .required(),
  password: yup
    .string()
    .min(3, obj => showErrors('Password', obj.value.length, obj.min))
    .required(),
  wallet: yup
    .string()
    .min(3, obj => showErrors('Wallet', obj.value.length, obj.min))
    .required()
})

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  wallet: ''
}

const SidebarAddDeveloper = props => {
  const [phoneNumber, setPhoneNumber] = useState()
  const [pass, setPass] = useState('')

  // ** Props
  const { open, toggle } = props

  // ** State
  const [projectData, setProjectData] = useState()
  const [isLoading, setIsLoading] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)
  const signer = state.signer.signer

  const handlePhoneNumber = newValue => {
    setPhoneNumber(newValue)
  }

  const {
    reset,
    control,
    setValue,
    setError,
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
      const { firstName, lastName, email, password, wallet } = data

      // const password = generateRandomString()
      // setPass(password)

      const landNFTInstance = new ethers.Contract(LandNftFactory.address, LandNftFactory.abi, signer)
      const landSaleInstance = new ethers.Contract(LandSaleFactory.address, LandSaleFactory.abi, signer)

      await (
        await landNFTInstance.grantRole('0x4504b9dfd7400a1522f49a8b4a100552da9236849581fd59b7363eb48c6a474c', wallet)
      ).wait()
      await (
        await landSaleInstance.grantRole('0x4504b9dfd7400a1522f49a8b4a100552da9236849581fd59b7363eb48c6a474c', wallet)
      ).wait()

      let params = {
        firstName,
        lastName,
        email,
        password,
        phone: phoneNumber,
        wallet,
        role: 'DEVELOPER',
        code: '5465'
      }

      let response = await fetch(`${BASE_URL_API}/auth/developer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.reducer.userData.userData.token.accessToken}`
        },
        body: JSON.stringify(params)
      })
      if (response.status === 200) {
        toast.success('Developer Added')
      }
    } catch (error) {
      toast.error(error.reason.toUpperCase())
    } finally {
      setIsLoading(false)
      toggle()
      reset()
    }
  }

  function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$'
    let result = ''

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      result += characters.charAt(randomIndex)
    }

    return result
  }

  const handleClose = () => {
    toggle()
    reset()
  }

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
        <Typography variant='h6'>Add Developer</Typography>
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
              name='firstName'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='First Name'
                  onChange={onChange}
                  placeholder='First Name'
                  error={Boolean(errors.firstName)}
                />
              )}
            />
            {errors.firstName && (
              <FormHelperText sx={{ color: 'error.main' }}>{errors.firstName.message}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='lastName'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Last Name'
                  onChange={onChange}
                  placeholder='Last Name'
                  error={Boolean(errors.lastName)}
                />
              )}
            />
            {errors.lastName && <FormHelperText sx={{ color: 'error.main' }}>{errors.lastName.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <MuiTelInput label='Phone' fullWidth sx={{ mb: 4 }} value={phoneNumber} defaultCountry='NL' onChange={handlePhoneNumber} />
            {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  type='email'
                  value={value}
                  label='Email'
                  onChange={onChange}
                  placeholder='Email'
                  error={Boolean(errors.email)}
                />
              )}
            />
            {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Password'
                  onChange={onChange}
                  placeholder='Password'
                  error={Boolean(errors.password)}
                />
              )}
            />
            {errors.password && <FormHelperText sx={{ color: 'error.main' }}>{errors.password.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='wallet'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Wallet Address'
                  onChange={onChange}
                  placeholder='Wallet Address'
                  error={Boolean(errors.wallet)}
                />
              )}
            />
            {errors.wallet && <FormHelperText sx={{ color: 'error.main' }}>{errors.wallet.message}</FormHelperText>}
          </FormControl>

          {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }}>
              Submit
            </Button>
            <Button variant='outlined' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
          </Box> */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CircularProgress />
                <Typography variant='h8'>Blockchain is being called! Please wait</Typography>
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

export default SidebarAddDeveloper
