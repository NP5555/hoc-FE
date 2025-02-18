import React, { useState } from 'react'
import { TextField, Button, Grid, Box } from '@mui/material'

const OtpForm = () => {
  const [otp, setOtp] = useState('')

  const handleInputChange = (event, index) => {
    const value = event.target.value
    if (value.length <= 1) {
      const newOtp = otp.split('')
      newOtp[index] = value
      setOtp(newOtp.join(''))
    }
  }

  const handleSubmit = event => {
    event.preventDefault()
    console.log('OTP:', otp)

    // Add your logic to verify the OTP here
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', px: 2 }}>
      <form onSubmit={handleSubmit} sx={{ m: 4 }}>
        <Grid container spacing={5} justifyContent='center' alignItems='center'>
          {[0, 1, 2, 3, 4, 5].map(index => (
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
                value={otp[index] || ''}
                onChange={event => handleInputChange(event, index)}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container justifyContent='center' sx={{ paddingTop: '20px' }}>
          <Grid item>
            <Button type='submit' variant='contained' disabled={otp.length !== 6} sx={{ width: '100%' }}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default OtpForm
