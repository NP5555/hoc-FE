// ** React Imports
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

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { addCurrency } from 'src/store/apps/user'
import { CircularProgress } from '@mui/material'

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
  name: yup
    .string()
    .min(3, obj => showErrors('Currency Name', obj.value.length, obj.min))
    .required(),
  tokenAddress: yup.string()
})

const defaultValues = {
  name: '',
  tokenAddress: ''
}

const SidebarAddCurrency = props => {
  // ** Props
  const { open, toggle } = props

  // ** State
  const [isLoading, setIsLoading] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

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

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const onSubmit = async data => {
    setIsLoading(true)

    try {
      const { name, tokenAddress } = data
      let params = {}
      if (!tokenAddress) {
        params = {
          token: state.reducer.userData.userData.token.accessToken,
          data: {
            name: name,
            isNative: true
          }
        }
      } else {
        params = {
          token: state.reducer.userData.userData.token.accessToken,
          data: {
            name: name,
            isNative: false,
            tokenAddress
          }
        }
      }

      await dispatch(addCurrency(params))

      // toggle()
    } catch (error) {
      console.log('🚀 ~ file: AddCurrencyDrawer.js:103 ~ onSubmit ~ error:', error)
    } finally {
      setIsLoading(false)
      handleClose()
    }
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
        <Typography variant='h6'>Add Currency</Typography>
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
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Currency Name'
                  onChange={onChange}
                  placeholder='Currency Name'
                  error={Boolean(errors.name)}
                />
              )}
            />
            {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
          </FormControl>
          <Typography>Leave this field empty if the currency is native</Typography>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='tokenAddress'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField value={value} label='TokenAddress' onChange={onChange} placeholder='TokenAddress' />
              )}
            />
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoading ? (
              <CircularProgress />
            ) : (
              <>
                <Button type='submit' variant='contained' sx={{ mr: 3 }}>
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

export default SidebarAddCurrency
