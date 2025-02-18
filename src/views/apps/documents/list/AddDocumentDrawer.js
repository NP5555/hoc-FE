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

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { addDocumentCatalog } from 'src/store/apps/user'
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

const SidebarAddDocument = props => {
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
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onChange'
  })

  const onSubmit = async data => {
    try {
      setIsLoading(true)
    } catch (error) {
      console.log('🚀 ~ file: AddCategoryDrawer.js:102 ~ onSubmit ~ error:', error)
    } finally {
      setIsLoading(false)
      handleClose()
    }
  }

  const handleFileChange = async e => {
    try {
      setIsLoading(true)

      let params = {
        token: state.reducer.userData.userData.token.accessToken,
        data: {
          document: e.target.files[0],
          isAdmin: true,
          userId: state.reducer.userData.userData.user.id
        }
      }
      await dispatch(addDocumentCatalog(params))
    } catch (error) {
    } finally {
      setIsLoading(false)
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
        <Typography variant='h6'>Add Document</Typography>
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
            {isLoading ? (
              <CircularProgress />
            ) : (
              <>
                <Controller
                  name='file'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange } }) => (
                    <input
                      type='file'
                      accept='.pdf, .doc, .docx'
                      onChange={e => {
                        onChange(e.target.files[0])
                        handleFileChange(e)
                      }}
                      style={{ display: 'none' }}
                      id='file-upload-input'
                    />
                  )}
                />
                <label htmlFor='file-upload-input'>
                  <Button variant='contained' component='span' fullWidth color='primary'>
                    Upload File
                    <Icon fontSize='1.125rem' icon='material-symbols:upload' size={24} />
                  </Button>
                </label>
              </>
            )}
          </FormControl>
          {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          </Box> */}
        </form>
      </Box>
    </Drawer>
  )
}

export default SidebarAddDocument
