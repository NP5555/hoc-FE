// ** React Imports
import { useState } from 'react'

import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import { MuiTelInput } from 'mui-tel-input'
import { register } from 'src/store/apps/user'

import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useDispatch } from 'react-redux'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useAuth } from 'src/hooks/useAuth'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Styled Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 700,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: {
    maxHeight: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxHeight: 500
  }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 600
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 750
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(1.75),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const Register = () => {
  // ** States
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState()
  const [confirmPassword, setConfirmPassword] = useState()
  const [email, setEmail] = useState()
  const [firstName, setFirstName] = useState()
  const [lastName, setLastName] = useState()
  const [phoneNumber, setPhoneNumber] = useState()
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isChecked, setIsChecked] = useState(false)

  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)

  const [loading, setLoading] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // ** Hooks
  const dispatch = useDispatch()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** functions
  const onSubmit = async e => {
    try {
      setLoading(true)
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address.')

        return
      }
      if (password.length < 5) {
        setPasswordError('Password must be at least 5 characters')

        toast.error('Password must be at least 5 characters')

        return
      }
      if (password !== confirmPassword) {
        toast.error("Oops! Passwords don't match. Retry")

        return
      }
      if (!isChecked) {
        toast.error('Terms and conditions not accepted. Please agree')

        return
      }
      if ((!firstName, !lastName, !email, !password, !phoneNumber, !isChecked, !account)) {
        toast.error('Please fill all fields')

        return
      } else {
        let data = {
          firstName,
          lastName,
          email,
          password,
          phone: phoneNumber,
          wallet: account,
          code: '132'
        }
        await dispatch(register(data))
      }
    } catch (error) {
      console.log('🚀 ~ file: index.js:149 ~ onSubmit ~ error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneNumber = newValue => {
    setPhoneNumber(newValue)
  }

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
    console.log('🚀 ~ file: index.js:168 ~ handleCheckboxChange ~ isChecked:', isChecked)
  }

  const getWeb3Provider = async () => {
    const providerOptions = {} // Additional provider options (e.g., Infura API key)

    const web3Modal = new Web3Modal({
      providerOptions
    })

    const provider = await web3Modal.connect()

    return new ethers.providers.Web3Provider(provider)
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed')

      return
    }
    try {
      const provider = await getWeb3Provider()
      const accounts = await provider.listAccounts()

      const chainId = (await provider.getNetwork()).chainId

      if (chainId !== 56) {
        let networkId = '0x38'

        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: networkId,
                chainName: 'BNB Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18
                },
                rpcUrls: ['https://bsc-dataseed.binance.org'],
                blockExplorerUrls: ['https://polygonscan.com']
              }
            ]
          })

          // Check if MetaMask is installed and connected
          if (window.ethereum) {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: networkId }]
            })
          } else {
            throw new Error('MetaMask is not installed or not connected')
          }
        } catch (error) {
          toast.error(error.message)
          console.error('Error switching MetaMask network:', error)
        }
      } else {
        const selectedAccount = accounts[0]

        setProvider(provider)
        setAccount(selectedAccount)
      }
    } catch (error) {
      toast.error('MetaMask is not installed')
    }
  }

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            borderRadius: '20px',
            justifyContent: 'center',
            backgroundColor: 'customColors.bodyBg',
            margin: theme => theme.spacing(8, 0, 8, 8)
          }}
        >
          <RegisterIllustration alt='sign-up' src={`/images/pages/hoc-auth.png`} />
          <FooterIllustrationsV2 />
        </Box>
      ) : null}
      <RightWrapper>
        <Box
          sx={{
            p: [6, 12],
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Box sx={{ my: 6 }}>
              <Typography sx={{ mb: 1.5, fontWeight: 500, fontSize: '1.625rem', lineHeight: 1.385 }}>
                Home Owners Club
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                It's time to gear up for the real estate revolution that's just around the corner!
              </Typography>
            </Box>
            <TextField
              fullWidth
              sx={{ mb: 4 }}
              label='First Name'
              onChange={e => {
                setFirstName(e.target.value)
              }}
              placeholder='john'
            />
            <TextField
              fullWidth
              sx={{ mb: 4 }}
              label='Last Name'
              onChange={e => {
                setLastName(e.target.value)
              }}
              placeholder='doe'
            />
            <TextField
              fullWidth
              label='Email'
              sx={{ mb: 4 }}
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                setEmailError('')
              }}
              placeholder='user@email.com'
              error={!!emailError}
              helperText={emailError}
            />
            <FormControl fullWidth>
              <InputLabel htmlFor='auth-login-v2-password'>Password</InputLabel>
              <OutlinedInput
                label='Password'
                sx={{ mb: 4 }}
                id='auth-login-v2-password'
                type={showPassword ? 'text' : 'password'}
                inputProps={{ minLength: 5 }}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Icon icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} fontSize={20} />
                    </IconButton>
                  </InputAdornment>
                }
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                error={!!passwordError}
                helperText={passwordError}
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel htmlFor='auth-login-v2-password'>Confirm Password</InputLabel>
              <OutlinedInput
                label='Confirm Password'
                sx={{ mb: 4 }}
                id='auth-login-v2-password'
                type={showPassword ? 'text' : 'password'}
                inputProps={{ minLength: 5 }}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Icon icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} fontSize={20} />
                    </IconButton>
                  </InputAdornment>
                }
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value)
                  setPasswordError('')
                }}
                error={!!passwordError}
                helperText={passwordError}
              />
            </FormControl>
            <MuiTelInput
              label='Phone'
              fullWidth
              sx={{ mb: 4 }}
              value={phoneNumber}
              defaultCountry='NL'
              onChange={handlePhoneNumber}
            />

            <FormControlLabel
              control={<Checkbox onChange={handleCheckboxChange} />}
              sx={{ mb: 4, mt: 1.5, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              on
              label={
                <>
                  <Typography variant='body2' component='span'>
                    I agree to{' '}
                  </Typography>
                  <LinkStyled href='/terms-and-conditions' target='_blank'>
                    terms and conditions
                  </LinkStyled>
                </>
              }
              required
            />

            <Button fullWidth size='large' type='submit' onClick={connectWallet} variant='contained' sx={{ mb: 4 }}>
              {account === null
                ? 'Connect Wallet'
                : account.slice(0, 5) + '...' + account.slice(account.length - 5, account.length)}
            </Button>
            <Button fullWidth size='large' type='submit' onClick={onSubmit} variant='contained' sx={{ mb: 4 }}>
              {loading ? <CircularProgress color='inherit' size={20} /> : 'Sign up'}
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Typography sx={{ color: 'text.secondary', mr: 2 }}>Already have an account?</Typography>
              <Typography variant='body2'>
                <LinkStyled href='/login' sx={{ fontSize: '1rem' }}>
                  Sign in instead
                </LinkStyled>
              </Typography>
            </Box>
            {/* <Divider
              sx={{
                fontSize: '0.875rem',
                color: 'text.disabled',
                '& .MuiDivider-wrapper': { px: 6 },
                my: theme => `${theme.spacing(6)} !important`
              }}
            >
              or
            </Divider>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconButton href='/' component={Link} sx={{ color: '#497ce2' }} onClick={e => e.preventDefault()}>
                <Icon icon='mdi:facebook' />
              </IconButton>
              <IconButton href='/' component={Link} sx={{ color: '#1da1f2' }} onClick={e => e.preventDefault()}>
                <Icon icon='mdi:twitter' />
              </IconButton>
              <IconButton
                href='/'
                component={Link}
                onClick={e => e.preventDefault()}
                sx={{ color: theme => (theme.palette.mode === 'light' ? '#272727' : 'grey.300') }}
              >
                <Icon icon='mdi:github' />
              </IconButton>
              <IconButton href='/' component={Link} sx={{ color: '#db4437' }} onClick={e => e.preventDefault()}>
                <Icon icon='mdi:google' />
              </IconButton>
            </Box> */}
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}
Register.getLayout = page => <BlankLayout>{page}</BlankLayout>
Register.guestGuard = true

export default Register
