// ** React Imports
import { useState } from 'react'

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
import { addUser } from 'src/store/apps/user'

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
  projectName: yup
    .string()
    .min(3, obj => showErrors('Project Name', obj.value.length, obj.min))
    .required(),
  location: yup
    .string()
    .min(3, obj => showErrors('Location URL', obj.value.length, obj.min))
    .required(),
  noOfPlots: yup
    .number()
    .typeError('Number of plots field is required')
    .min(10, obj => showErrors('Number of plots', obj.value.length, obj.min))
    .required(),
  sqFeet: yup
    .number()
    .typeError('Square feet field is required')
    .min(10, obj => showErrors('Sq. ft ', obj.value.length, obj.min))
    .required(),
  noOfBlocks: yup
    .number()
    .typeError('Number of blocks field is required')
    .min(10, obj => showErrors('Number of blocks', obj.value.length, obj.min))
    .required()
})

const defaultValues = {
  projectName: '',
  location: '',
  noOfPlots: Number(''),
  noOfBlocks: Number(''),
  sqFeet: Number('')
}

const SidebarAddAdmin = props => {
  // ** Props
  const { open, toggle } = props

  // ** State
  const [role, setRole] = useState()

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.user)

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

  const onSubmit = data => {
    console.log('🚀 ~ file: AddUserDrawer.js:98 ~ onSubmit ~ data:', data)
  }

  const handleClose = () => {
    setRole('')
    setValue('contact', Number(''))
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
              name='projectName'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Project Name'
                  onChange={onChange}
                  placeholder='Clifton'
                  error={Boolean(errors.firstName)}
                />
              )}
            />
            {errors.projectName && (
              <FormHelperText sx={{ color: 'error.main' }}>{errors.projectName.message}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='noOfPlots'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  type='number'
                  label='No. of Plots'
                  onChange={onChange}
                  placeholder='700'
                  error={Boolean(errors.noOfPlots)}
                />
              )}
            />
            {errors.noOfPlots && (
              <FormHelperText sx={{ color: 'error.main' }}>{errors.noOfPlots.message}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='blocks'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  type='number'
                  label='No. of Blocks'
                  onChange={onChange}
                  placeholder='6 Blocks'
                  error={Boolean(errors.blocks)}
                />
              )}
            />
            {errors.blocks && <FormHelperText sx={{ color: 'error.main' }}>{errors.blocks.message}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='sqFeet'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  type='number'
                  label='Area'
                  onChange={onChange}
                  placeholder='1275 Sq. Ft'
                  error={Boolean(errors.sqFeet)}
                />
              )}
            />
            {errors.sqFeet && <FormHelperText sx={{ color: 'error.main' }}>{errors.sqFeet.message}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='location'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Location'
                  onChange={onChange}
                  placeholder='URL of Google maps pin location'
                  error={Boolean(errors.location)}
                />
              )}
            />
            {errors.location && <FormHelperText sx={{ color: 'error.main' }}>{errors.location.message}</FormHelperText>}
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }}>
              Submit
            </Button>
            <Button variant='outlined' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default SidebarAddAdmin
