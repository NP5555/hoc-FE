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
import axios from 'axios'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { kyc } from 'src/store/apps/user'
import { formatErrorMessage, logError } from 'src/utils/errorHandler'

const KYC = () => {
  const [previewPassport, setPreviewPassport] = useState(null)
  const [previewNicFront, setPreviewNicFront] = useState(null)
  const [previewNicBack, setPreviewNicBack] = useState(null)
  const [previewSignature, setPreviewSignature] = useState(null)

  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const state = useSelector(state => state)
  const userKyc = state?.reducer?.kyc?.kyc?.status

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    street: '',
    state: '',
    postalCode: '',
    mobileNumber: '',
    company: '',
    pubkey: '',
    experience: '',
    sourceOfIncome: '',
    otherSourceOfIncome: '',
    riskProfile: '',
    experience: '',
    certificates: '',
    passportImage: '',
    nicFrontImage: '',
    nicBackImage: '',
    signatureImage: '',
    isPassport: false,
    userId: ''
  })

  const [errors, setErrors] = useState({})

  // Pinata credentials
  const pinataApiKey = '1acc89c3ecbd58333e9d'
  const pinataSecretApiKey = 'a546f01c561adfa84518187f253b6eefe3220f4d5c7eb0fb30f60673c4d91f9d'
  const pinataJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0M2I3ZDRlOS1hZDUzLTRkYzQtYmI5My0wYjBhMmJkYWZjNDUiLCJlbWFpbCI6Im5ncy5uYWVlbWFzaHJhZkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMWFjYzg5YzNlY2JkNTgzMzNlOWQiLCJzY29wZWRLZXlTZWNyZXQiOiJhNTQ2ZjAxYzU2MWFkZmE4NDUxODE4N2YyNTNiNmVlZmUzMjIwZjRkNWM3ZWIwZmIzMGY2MDY3M2M0ZDkxZjlkIiwiZXhwIjoxNzc0MzQ1MDgxfQ.5ObykNMJUjCf5BNPF3ChmmLyn-G6hfTgKeahC7QHFJw'
  const pinataGateway = 'https://red-impressive-beetle-555.mypinata.cloud'
  
  const dispatch = useDispatch()

  // Email validation
  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)
  }

  const handleDeletePassportImage = () => {
    setFormData(prevData => ({
      ...prevData,
      passportImage: '',
      isPassport: false
    }))
    setPreviewPassport(null)
    console.log('Passport image deleted')
  }

  const handleDeleteNicFrontImage = () => {
    setFormData(prevData => ({
      ...prevData,
      nicFrontImage: ''
    }))
    setPreviewNicFront(null)
    console.log('NIC front image deleted')
  }

  const handleDeleteNicBackImage = () => {
    setFormData(prevData => ({
      ...prevData,
      nicBackImage: ''
    }))
    setPreviewNicBack(null)
    console.log('NIC back image deleted')
  }

  const handleDeleteSignature = () => {
    setFormData(prevData => ({
      ...prevData,
      signatureImage: ''
    }))
    setPreviewSignature(null)
    console.log('Signature image deleted')
  }

  const uploadToPinata = async (file) => {
    if (!file) {
      console.error('No file provided to uploadToPinata');
      return null;
    }
    
    // Log the file being uploaded for debugging
    console.log('Uploading file to Pinata:', file.name, file.size, file.type);
    
    // Creating FormData
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log('Starting Pinata upload with JWT authentication');
      
      // Use pure fetch API with JWT authentication
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`
        },
        body: formData
      });
      
      // Check for non-OK response
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pinata error response:', errorText);
        throw new Error(`Pinata upload failed with status: ${response.status}. ${errorText}`);
      }
      
      // Parse the successful response
      const data = await response.json();
      console.log('Pinata upload successful:', data);
      
      if (data && data.IpfsHash) {
        const ipfsUrl = `${pinataGateway}/ipfs/${data.IpfsHash}`;
        console.log('Generated IPFS URL:', ipfsUrl);
        return ipfsUrl;
      } else {
        logError('Pinata upload', 'No IPFS hash returned');
        return null;
      }
    } catch (error) {
      logError('Pinata upload', error);
      console.error('Pinata upload error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) {
      toast.error('No file selected')
      return
    }
    
    // Set loading state
    setLoading(true)

    const reader = new FileReader()

    try {
      const ipfsUrl = await uploadToPinata(file)
      if (!ipfsUrl) {
        toast.error('Failed to upload to Pinata. Please try again.')
        setLoading(false)
        return
      }
      
      const fieldName = e.target.name

      // Update the appropriate preview based on the field name
      if (fieldName === 'passportImage') {
        setPreviewPassport(URL.createObjectURL(file))
        
        // If passport is provided, set NIC to "no image" placeholders
        setFormData(prevData => ({
          ...prevData,
          passportImage: ipfsUrl,
          nicFrontImage: 'no image',
          nicBackImage: 'no image',
          isPassport: true
        }))
        
        // Clear NIC previews if they exist
        setPreviewNicFront(null)
        setPreviewNicBack(null)
        
      } else if (fieldName === 'nicFrontImage') {
        setPreviewNicFront(URL.createObjectURL(file))
        
        // If NIC front is provided, set passport to "no image" placeholder
        setFormData(prevData => ({
          ...prevData,
          nicFrontImage: ipfsUrl,
          passportImage: 'no image',
          isPassport: false
        }))
        
        // Clear passport preview if it exists
        setPreviewPassport(null)
        
      } else if (fieldName === 'nicBackImage') {
        setPreviewNicBack(URL.createObjectURL(file))
        
        // If NIC back is provided, set passport to "no image" placeholder
        setFormData(prevData => ({
          ...prevData,
          nicBackImage: ipfsUrl,
          passportImage: 'no image',
          isPassport: false
        }))
        
        // Clear passport preview if it exists
        setPreviewPassport(null)
        
      } else if (fieldName === 'signatureImage') {
        setPreviewSignature(URL.createObjectURL(file))
        
        setFormData(prevData => ({
          ...prevData,
          signatureImage: ipfsUrl
        }))
      }
      
      toast.success(`${fieldName.replace('Image', '')} image uploaded successfully!`)
      
    } catch (error) {
      logError('Pinata image upload', error)
      toast.error(formatErrorMessage(error, 'Error uploading image. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleMobileNumber = mobileNumber => {
    setFormData(prevData => ({
      ...prevData,
      mobileNumber: mobileNumber
    }))
    delete errors.mobileNumber
  }

  const handleChange = e => {
    setFormData(prevData => ({
      ...prevData,
      [e.target.name]: e.target.value
    }))
  }

  const getWeb3Provider = async () => {
    const providerOptions = {}

    const web3Modal = new Web3Modal({
      providerOptions
    })

    const provider = await web3Modal.connect()

    return new ethers.providers.Web3Provider(provider)
  }

  const connectWallet = async e => {
    e.preventDefault()
    const provider = await getWeb3Provider()
    const accounts = await provider.listAccounts()
    setFormData(prevData => ({
      ...prevData,
      pubkey: accounts[0]
    }))
  }

  const handleValidate = () => {
    const newErrors = {}
    
    // Debug output for validation before processing
    console.log("Form Data before validation:", { ...formData })
    
    // Special handling for ID documents (passport vs NIC)
    const hasPassport = formData.passportImage && 
                        formData.passportImage !== '' && 
                        formData.passportImage !== 'no image'
                        
    const hasNicFront = formData.nicFrontImage && 
                        formData.nicFrontImage !== '' && 
                        formData.nicFrontImage !== 'no image'
                        
    const hasNicBack = formData.nicBackImage && 
                       formData.nicBackImage !== '' && 
                       formData.nicBackImage !== 'no image'
    
    const hasCompleteNic = hasNicFront && hasNicBack
    
    // Check if at least one form of ID is provided
    if (!hasPassport && !hasCompleteNic) {
      if (!hasPassport) {
        newErrors.passportImage = 'Please provide passport or national ID'
      }
      
      if (!hasNicFront) {
        newErrors.nicFrontImage = 'Please provide front of ID'
      }
      
      if (!hasNicBack) {
        newErrors.nicBackImage = 'Please provide back of ID'
      }
    }

    // Check for empty fields and additional validation rules
    Object.entries(formData).forEach(([key, value]) => {
      // Skip ID validation since we already handled it above
      if (key === 'passportImage' || key === 'nicFrontImage' || key === 'nicBackImage') {
        return;
      }
      
      if (value === '' || value === null) {
        // Skip certain fields that can be empty
        if (key === 'otherSourceOfIncome' && formData.sourceOfIncome !== 'others') {
          return; // Skip validation for this field
        }
        
        // Skip userId as it will be set automatically
        if (key === 'userId') {
          return;
        }
        
        newErrors[key] = 'This field is required'
      }
    })

    if (formData.email !== '' && !isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (formData.sourceOfIncome === 'others') {
      if (!formData.otherSourceOfIncome || formData.otherSourceOfIncome === '') {
        newErrors.otherSourceOfIncome = 'Please specify the other source of income'
      }
    }

    // Debug output for validation
    console.log("Validation Errors:", newErrors)
    
    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()

    setLoading(true)
    
    // Make sure userId is set before validation
    formData.userId = state?.reducer?.userData?.userData?.user?.id
    
    // Make sure empty "no image" placeholders are handled correctly
    // If passport is provided, set NIC to "no image" placeholders
    if (formData.passportImage && formData.passportImage !== '' && formData.passportImage !== 'no image') {
      formData.nicFrontImage = 'no image'
      formData.nicBackImage = 'no image'
      formData.isPassport = true
    }
    
    // If NIC is provided, set passport to "no image" placeholder
    if ((formData.nicFrontImage && formData.nicFrontImage !== '' && formData.nicFrontImage !== 'no image') &&
        (formData.nicBackImage && formData.nicBackImage !== '' && formData.nicBackImage !== 'no image')) {
      formData.passportImage = 'no image'
      formData.isPassport = false
    }
    
    // If sourceOfIncome is "others", use the value from otherSourceOfIncome
    if (formData.sourceOfIncome === 'others' && formData.otherSourceOfIncome) {
      formData.sourceOfIncome = formData.otherSourceOfIncome
    }

    const isValidated = handleValidate()
    
    console.log("Form is validated:", isValidated)
    
    if (isValidated) {
      try {
        console.log("Submitting KYC data:", formData)
        const submissionData = { ...formData }
        
        // If we have a userId, proceed with submission
        if (submissionData.userId) {
          await dispatch(kyc(submissionData))
          toast.success('KYC submitted successfully!')
          router.push(`../../dashboards/analytics/`, undefined, { shallow: true })
        } else {
          toast.error('User ID is missing. Please try again or log in again.')
          console.error("Missing user ID for KYC submission")
        }
      } catch (error) {
        logError('KYC submission', error)
        toast.error(formatErrorMessage(error, 'Failed to submit KYC'))
      } finally {
        setLoading(false)
      }
    } else {
      console.error("Form validation failed:", errors)
      
      // Show a more helpful error message
      if (Object.keys(errors).length > 0) {
        const missingFields = Object.keys(errors).join(', ')
        toast.error(`Form is incomplete. Please fill in the following fields: ${missingFields}`)
      } else {
        toast.error('Form is incomplete. Please fill in all required fields.')
      }
      
      setLoading(false)
    }
  }

  return (
    <>
      {userKyc === 'approved' ? (
        <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
          <Typography variant='h4' component='h1' gutterBottom>
            Your KYC is approved
          </Typography>
        </Box>
      ) : (
        <Container maxWidth='md'>
          <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
            <Typography variant='h4' component='h1' gutterBottom>
              KYC (Know your costumer)
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={2}>
                <Typography variant='subtitle1'>Name:</Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  name='firstName'
                  label='First Name'
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  name='lastName'
                  label='Last Name'
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant='subtitle1'>Email:</Typography>
              </Grid>
              <Grid item xs={12} sm={10}>
                <TextField
                  name='email'
                  label='Email'
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant='subtitle1'>Address:</Typography>
              </Grid>
              <Grid item xs={12} sm={10}>
                <TextField
                  name='address'
                  label='Address'
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}></Grid>
              <Grid item xs={12} sm={10}>
                <TextField
                  name='street'
                  label='Street'
                  value={formData.street}
                  onChange={handleChange}
                  error={!!errors.street}
                  helperText={errors.street}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}></Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  name='state'
                  label='State/Province'
                  value={formData.state}
                  onChange={handleChange}
                  error={!!errors.state}
                  helperText={errors.state}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  name='postalCode'
                  label='Postal Code'
                  value={formData.postalCode}
                  onChange={handleChange}
                  error={!!errors.postalCode}
                  helperText={errors.postalCode}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant='subtitle1'>Mobile Number:</Typography>
              </Grid>
              <Grid item xs={12} sm={10}>
                <MuiTelInput
                  name='mobileNumber'
                  label='Mobile Number'
                  value={formData.mobileNumber}
                  onChange={handleMobileNumber}
                  error={!!errors.mobileNumber}
                  helperText={errors.mobileNumber}
                  defaultCountry='NL'
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant='subtitle1'>Company:</Typography>
              </Grid>
              <Grid item xs={12} sm={10}>
                <TextField
                  name='company'
                  label='Company'
                  value={formData.company}
                  onChange={handleChange}
                  error={!!errors.company}
                  helperText={errors.company}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Button variant='contained' color='primary' onClick={e => connectWallet(e)} fullWidth>
                  {formData.pubkey === null || formData.pubkey === ''
                    ? 'Connect Wallet'
                    : formData.pubkey.slice(0, 5) +
                      '...' +
                      formData.pubkey.slice(formData.pubkey.length - 5, formData.pubkey.length)}
                </Button>
              </Grid>

              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant='subtitle1'>No. of Certificates:</Typography>
              </Grid>
              <Grid item xs={12} sm={10}>
                <TextField
                  name='certificates'
                  label='No. of Certificates'
                  value={formData.certificates}
                  onChange={handleChange}
                  error={!!errors.certificates}
                  helperText={errors.certificates}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant='subtitle1'>What is your experience in investing?</Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <RadioGroup
                  value={formData.experience}
                  error={!!errors.experience}
                  onChange={handleChange}
                  name='experience'
                >
                  <FormControlLabel value='brandNew' control={<Radio />} label='Brand New' />
                  <FormControlLabel value='beginner' control={<Radio />} label='Beginner' />
                  <FormControlLabel value='someExperience' control={<Radio />} label='Some Expereince' />
                  <FormControlLabel value='experienced' control={<Radio />} label='Expereinced' />
                </RadioGroup>
                {errors.experience && <FormHelperText style={{ color: 'red' }}>{errors.experience}</FormHelperText>}
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} sm={5}>
                <Typography variant='subtitle1'>Source of income ?</Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <RadioGroup
                  value={formData.sourceOfIncome}
                  error={!!errors.sourceOfIncome}
                  onChange={handleChange}
                  name='sourceOfIncome'
                >
                  <FormControlLabel value='Wage' control={<Radio />} label='Wage' />
                  <FormControlLabel value='Company' control={<Radio />} label='Company' />
                  <FormControlLabel value='Property' control={<Radio />} label='Property' />
                  <FormControlLabel value='Investment' control={<Radio />} label='Investments' />
                  <FormControlLabel value='Heritage' control={<Radio />} label='Heritage' />
                  <FormControlLabel value='Pension' control={<Radio />} label='Pension' />
                  <FormControlLabel value='others' control={<Radio />} label='Others' />
                </RadioGroup>
                {formData.sourceOfIncome === 'others' && (
                  <TextField
                    name='otherSourceOfIncome'
                    label='Other Source of Income'
                    value={formData.otherSourceOfIncome === 'others' ? '' : formData.otherSourceOfIncome}
                    onChange={handleChange}
                    fullWidth
                  />
                )}
                {errors.sourceOfIncome && (
                  <FormHelperText style={{ color: 'red' }}>{errors.sourceOfIncome}</FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant='subtitle1'>Risk profile?</Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <RadioGroup
                  value={formData.riskProfile}
                  error={!!errors.riskProfile}
                  helperText={errors.riskProfile}
                  onChange={handleChange}
                  name='riskProfile'
                >
                  <FormControlLabel value='lowRisk' control={<Radio />} label='Low Risk' />
                  <FormControlLabel value='middleRisk' control={<Radio />} label='Middle Risk' />
                  <FormControlLabel value='highRisk' control={<Radio />} label='High Risk' />
                </RadioGroup>
                {errors.riskProfile && <FormHelperText style={{ color: 'red' }}>{errors.riskProfile}</FormHelperText>}
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                  Identity Verification
                </Typography>
                <Typography variant='body1' gutterBottom sx={{ color: 'text.secondary', mb: 2 }}>
                  Please provide either your passport OR national ID card (front and back).
                </Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant='subtitle1' sx={{ fontWeight: 'medium' }}>
                  Option 1: Passport 
                  <Typography variant='caption' component="span" sx={{ ml: 1 }}>
                    (all quadrangles must be visible)
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={7}>
                <Box>
                  <TextField
                    type='file'
                    name='passportImage'
                    error={!!errors.passportImage}
                    helperText={errors.passportImage}
                    onChange={handleImageUpload}
                    disabled={previewNicFront !== null || previewNicBack !== null}
                    inputProps={{
                      accept: 'image/*'
                    }}
                  />
                  {previewPassport !== null && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src={previewPassport} alt='Passport Preview' style={{ maxHeight: '150px', borderRadius: '4px' }} />
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        onClick={handleDeletePassportImage}
                        sx={{ mt: 1 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>OR</Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant='subtitle1' sx={{ fontWeight: 'medium' }}>
                  Option 2: National ID Card 
                  <Typography variant='caption' component="span" sx={{ ml: 1 }}>
                    (all quadrangles must be visible)
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box>
                  <Typography variant='body2' gutterBottom>Front of ID:</Typography>
                  <TextField
                    type='file'
                    name='nicFrontImage'
                    error={!!errors.nicFrontImage}
                    helperText={errors.nicFrontImage}
                    onChange={handleImageUpload}
                    disabled={previewPassport !== null}
                    inputProps={{
                      accept: 'image/*'
                    }}
                  />
                  {previewNicFront !== null && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src={previewNicFront} alt='ID Front Preview' style={{ maxHeight: '150px', borderRadius: '4px' }} />
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        onClick={handleDeleteNicFrontImage}
                        sx={{ mt: 1 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant='body2' gutterBottom>Back of ID:</Typography>
                  <TextField
                    type='file'
                    name='nicBackImage'
                    error={!!errors.nicBackImage}
                    helperText={errors.nicBackImage}
                    onChange={handleImageUpload}
                    disabled={previewPassport !== null}
                    inputProps={{
                      accept: 'image/*'
                    }}
                  />
                  {previewNicBack !== null && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src={previewNicBack} alt='ID Back Preview' style={{ maxHeight: '150px', borderRadius: '4px' }} />
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        onClick={handleDeleteNicBackImage}
                        sx={{ mt: 1 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant='subtitle1'>Signature (Image of your signature)</Typography>
              </Grid>
              <Grid item xs={12} sm={7}>
                <Box>
                  <TextField
                    type='file'
                    name='signatureImage'
                    error={!!errors.signatureImage}
                    helperText={errors.signatureImage}
                    onChange={handleImageUpload}
                    inputProps={{
                      accept: 'image/*'
                    }}
                  />
                  {previewSignature !== null && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src={previewSignature} alt='Signature Preview' style={{ maxHeight: '100px', borderRadius: '4px' }} />
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        onClick={handleDeleteSignature}
                        sx={{ mt: 1 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} marginTop={3} marginBottom={6}>
                {loading ? (
                  <CircularProgress size={28} />
                ) : (
                  <Button type='submit' variant='contained' color='primary' fullWidth>
                    Submit
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </Container>
      )}
    </>
  )
}

export default KYC

