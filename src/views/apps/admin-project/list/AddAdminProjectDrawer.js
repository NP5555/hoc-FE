// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { toast } from 'react-hot-toast'
import { BASE_URL_API } from 'src/configs/const'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const schema = yup.object().shape({
  name: yup.string().required('Project name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  categoryId: yup.string().required('Category is required'),
  currencyId: yup.string().required('Currency is required'),
  nftAddress: yup.string().required('NFT Address is required'),
  saleAddress: yup.string().required('Sale Address is required')
})

const AddAdminProjectDrawer = props => {
  // ** Props
  const { open, toggle } = props

  // ** State
  const [loading, setLoading] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      categoryId: '',
      currencyId: '',
      nftAddress: '',
      saleAddress: ''
    },
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    try {
      setLoading(true)
      const token = state.reducer?.userData?.userData?.token?.accessToken
      const adminId = state.reducer?.userData?.userData?.user?.id

      if (!token || !adminId) {
        toast.error('Authentication required')
        return
      }

      const projectData = {
        ...data,
        developerId: adminId, // Use admin ID as developer for admin-created projects
        price: parseFloat(data.price)
      }

      const response = await fetch(`${BASE_URL_API}/project/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Project created successfully!')
        reset()
        toggle()
        // Optionally refresh the project list here
      } else {
        toast.error(result.message || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Error creating project')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  // Get categories and currencies from state
  const categories = state.category?.categoryData?.data || []
  const currencies = state.currency?.currencyData?.data || []

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
        <Typography variant='h6'>Add New Project</Typography>
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
                  label='Project Name'
                  onChange={onChange}
                  placeholder='Enter project name'
                  error={Boolean(errors.name)}
                />
              )}
            />
            {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='description'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Description'
                  onChange={onChange}
                  placeholder='Enter project description'
                  multiline
                  rows={3}
                  error={Boolean(errors.description)}
                />
              )}
            />
            {errors.description && <FormHelperText sx={{ color: 'error.main' }}>{errors.description.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='price'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  type='number'
                  value={value}
                  label='Price'
                  onChange={onChange}
                  placeholder='Enter price'
                  error={Boolean(errors.price)}
                />
              )}
            />
            {errors.price && <FormHelperText sx={{ color: 'error.main' }}>{errors.price.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel id='category-select'>Category</InputLabel>
            <Controller
              name='categoryId'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onChange={onChange}
                  label='Category'
                  labelId='category-select'
                  error={Boolean(errors.categoryId)}
                >
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.categoryId && <FormHelperText sx={{ color: 'error.main' }}>{errors.categoryId.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel id='currency-select'>Currency</InputLabel>
            <Controller
              name='currencyId'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onChange={onChange}
                  label='Currency'
                  labelId='currency-select'
                  error={Boolean(errors.currencyId)}
                >
                  {currencies.map(currency => (
                    <MenuItem key={currency.id} value={currency.id}>
                      {currency.name} ({currency.symbol})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.currencyId && <FormHelperText sx={{ color: 'error.main' }}>{errors.currencyId.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='nftAddress'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='NFT Address'
                  onChange={onChange}
                  placeholder='Enter NFT contract address'
                  error={Boolean(errors.nftAddress)}
                />
              )}
            />
            {errors.nftAddress && <FormHelperText sx={{ color: 'error.main' }}>{errors.nftAddress.message}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <Controller
              name='saleAddress'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  label='Sale Address'
                  onChange={onChange}
                  placeholder='Enter sale contract address'
                  error={Boolean(errors.saleAddress)}
                />
              )}
            />
            {errors.saleAddress && <FormHelperText sx={{ color: 'error.main' }}>{errors.saleAddress.message}</FormHelperText>}
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              size='large' 
              type='submit' 
              variant='contained' 
              sx={{ mr: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Submit'}
            </Button>
            <Button size='large' variant='outlined' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default AddAdminProjectDrawer 