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
  description: yup
    .string()
    .min(3, obj => showErrors('Description', obj.value.length, obj.min))
    .required(),
  project: yup
    .string()
    .min(3, obj => showErrors('Project', obj.value.length, obj.min))
    .required()
})

const defaultValues = {
  name: '',
  description: '',
  project: ''
}

const SidebarAddCurrency = props => {
  // ** Props
  const { open, toggle } = props

  // ** State
  const [projectData, setProjectData] = useState()
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

  const onSubmit = async data => {
    try {
      setIsLoading(true)
      const { name, description, project } = data

      let params = {
        name,
        description,
        project,
        token: state.reducer.userData.userData.token.accessToken
      }
      await dispatch(addType(params))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
      toggle()
      reset()
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    dispatch(
      fetchProject({
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
        <Typography variant='h6'>Add Type</Typography>
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
                  label='Type Name'
                  onChange={onChange}
                  placeholder='Type Name'
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
                  placeholder='Description'
                  error={Boolean(errors.description)}
                />
              )}
            />
            {errors.description && (
              <FormHelperText sx={{ color: 'error.main' }}>{errors.description.message}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel id='project-label'>Project</InputLabel>
            <Controller
              name='project'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select labelId='project-label' value={value} onChange={onChange} error={Boolean(errors.project)}>
                  {!state?.project?.projectData?.data ? (
                    <Spinner />
                  ) : (
                    state?.project?.projectData?.data.map(project => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
            {errors.project && <FormHelperText sx={{ color: 'error.main' }}>{errors.project.message}</FormHelperText>}
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
                <Typography variant='h8'>Blockchain is being called! Please wait.</Typography>
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

export default SidebarAddCurrency
