import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import {
  TextField,
  Button,
  Grid,
  Typography,
  Container,
  Box,
  FormControlLabel,
  FormHelperText,
  Divider,
  Radio,
  RadioGroup,
  CircularProgress
} from '@mui/material'
import { MuiTelInput } from 'mui-tel-input'
import toast from 'react-hot-toast'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'
import { kyc } from 'src/store/apps/user'
import { BASE_URL_API } from 'src/configs/const'

const Password = () => {
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()
  const state = useSelector(state => state)
  const userKyc = state?.reducer?.kyc?.kyc?.status

  const handlePasswordChange = async () => {
    setLoading(true)
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
    } else {
      setError(null)

      try {
        let data = {
          token: state?.reducer?.userData?.userData?.token?.accessToken,
          data: {
            currentPassword: currentPassword,
            newPassword: confirmPassword
          }
        }

        let response = await fetch(`${BASE_URL_API}/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`
          },
          body: JSON.stringify(data.data)
        })
        response = await response.json()
        console.log('🚀 ~ file: index.js:61 ~ handlePasswordChange ~ response:', response)
        if (response.statusCode !== 200) {
          toast.error(response.message)
        } else {
          toast.success(response.message)
        }
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  console.log(state)

  return (
    <Container maxWidth='sm'>
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component='h1' variant='h5'>
          Change Password
        </Typography>
        <Box component='form' noValidate sx={{ mt: 3 }}>
          <TextField
            margin='normal'
            required
            fullWidth
            name='currentPassword'
            label='Current Password'
            type='password'
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            name='newPassword'
            label='New Password'
            type='password'
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            name='confirmPassword'
            label='Confirm Password'
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          {error && <Typography color='error'>{error}</Typography>}
          {loading ? (
            <Button type='button' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }} disabled>
              <CircularProgress size={28} />
            </Button>
          ) : (
            <Button type='button' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }} onClick={handlePasswordChange}>
              Change Password
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  )
}

export default Password
