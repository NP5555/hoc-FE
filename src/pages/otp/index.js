import React, { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { TextField, Button, Grid, Box, Typography, CircularProgress } from '@mui/material'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import Image from 'next/image'
import { loginOTP } from 'src/store/apps/user'
import { toast } from 'react-hot-toast'

const OtpForm = () => {
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)

  const inputRefs = useRef(
    Array(6)
      .fill(null)
      .map(() => React.createRef())
  )

  const state = useSelector(state => state)
  const dispatch = useDispatch()

  const handleInputChange = (event, index) => {
    const value = event.target.value

    if (value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      if (index > 0 && value.length === 0 && inputRefs.current[index - 1].current) {
        inputRefs.current[index - 1].current.focus()
      } else if (index < 5 && value.length === 1 && inputRefs.current[index + 1].current) {
        inputRefs.current[index + 1].current.focus()
      }
    }
  }

  const handlePaste = event => {
    const pastedText = event.clipboardData.getData('text/plain').trim()

    if (/^\d{6}$/.test(pastedText)) {
      const newOtp = pastedText.split('').slice(0, 6)
      setOtp(newOtp)
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    try {
      setLoading(true)
      
      // Debug logging to check Redux state
      console.log('Current Redux state:', state)
      console.log('UserData:', state?.reducer?.userData?.userData)
      
      // Get access token from Redux store
      const accessToken = state?.reducer?.userData?.userData?.token?.accessToken
      
      if (!accessToken) {
        console.error('No access token found in Redux store')
        toast.error('Authentication error. Please login again.')
        setLoading(false)
        return
      }
      
      console.log('Using access token:', accessToken)
      
      const data = {
        otp: parseInt(otp.join(''), 10),
        token: accessToken
      }
      
      console.log('Submitting OTP data:', data)
      await dispatch(loginOTP(data))
    } catch (error) {
      console.error('OTP submission error:', error)
      toast.error(error.message || 'Error validating OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Box textAlign='center' my={4}>
        <Image alt='Home Owners Club' src={`/images/pages/hoc-logo.png`} width={150} height={150} />
      </Box>
      <Typography textAlign='center' variant='h6' gutterBottom>
        Kindly input the One-Time Password (OTP) sent to your email for secure login.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh', px: 2 }}>
        <form onSubmit={handleSubmit} sx={{ m: 4 }}>
          <Grid container spacing={5} justifyContent='center' alignItems='center'>
            {otp.map((value, index) => (
              <Grid item xs={3} sm={2} md={2} lg={1} key={index}>
                <TextField
                  id={`otp-${index}`}
                  variant='outlined'
                  type='number'
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }
                  }}
                  sx={{
                    width: '100%',
                    '& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button': {
                      '-webkit-appearance': 'none',
                      margin: 0
                    }
                  }}
                  value={value}
                  onChange={event => handleInputChange(event, index)}
                  onPaste={handlePaste}
                  inputRef={inputRefs.current[index]}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container justifyContent='center' sx={{ paddingTop: '20px' }}>
            <Grid item>
              {loading ? (
                <>
                  <Button type='submit' variant='contained' disabled sx={{ width: '100%' }}>
                    <CircularProgress size={28} />
                  </Button>
                </>
              ) : (
                <>
                  <Button type='submit' variant='contained' disabled={otp.length !== 6} sx={{ width: '100%' }}>
                    Confirm
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </form>
      </Box>
    </>
  )
}

OtpForm.getLayout = page => <BlankLayout>{page}</BlankLayout>
OtpForm.guestGuard = true

export default OtpForm
