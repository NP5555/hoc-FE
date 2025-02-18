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
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'

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

  const projectId = '2I1oqhW4ncFv71LUKDOVWWRZ1ZH'
  const projectSecret = 'd8538b15a850ae329e8b348dbbd6311d'
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

  const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth
    }
  })

  const dispatch = useDispatch()

  // Email validation
  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)
  }

  const handleDeletePassportImage = () => {
    setFormData(prevData => ({
      ...prevData,
      passportImage: null,
      isPassport: false
    }))
    setPreviewPassport(null)
  }

  const handleDeleteNicFrontImage = () => {
    setFormData(prevData => ({
      ...prevData,
      nicFrontImage: null
    }))
    setPreviewNicFront(null)
  }

  const handleDeleteNicBackImage = () => {
    setFormData(prevData => ({
      ...prevData,
      nicBackImage: null
    }))
    setPreviewNicBack(null)
  }

  const handleDeleteSignature = () => {
    setFormData(prevData => ({
      ...prevData,
      signatureImage: null
    }))
    setPreviewSignature(null)
  }

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    const reader = new FileReader()

    const uploadImage = async (name, previewState) => {
      try {
        const result = await client.add(file)
        setFormData(prevData => ({
          ...prevData,
          [name]: `https://marketplace-argon.infura-ipfs.io/ipfs/${result.path}`
        }))
        reader.onload = e => {
          previewState(e.target.result)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        toast.error(error)
      }
    }

    if (e.target.name === 'passportImage') {
      setFormData(prevData => ({
        ...prevData,
        nicFrontImage: 'no image',
        nicBackImage: 'no image'
      }))
      setFormData(prevData => ({
        ...prevData,
        isPassport: true
      }))
      uploadImage('passportImage', setPreviewPassport)
    } else if (e.target.name === 'nicFrontImage') {
      setFormData(prevData => ({
        ...prevData,
        passportImage: 'no image'
      }))
      uploadImage('nicFrontImage', setPreviewNicFront)
    } else if (e.target.name === 'nicBackImage') {
      setFormData(prevData => ({
        ...prevData,
        passportImage: 'no image'
      }))
      uploadImage('nicBackImage', setPreviewNicBack)
    } else if (e.target.name === 'signatureImage') {
      uploadImage('signatureImage', setPreviewSignature)
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

    // Check for empty fields and additional validation rules
    Object.entries(formData).forEach(([key, value]) => {
      if (value === '' || value === null) {
        newErrors[key] = 'This field is required'
      }
    })

    if (formData.email !== '' && !isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (formData.sourceOfIncome === 'others') {
      formData.sourceOfIncome = formData.otherSourceOfIncome
    }

    if (formData.passportImage) {
      formData.isPassport = true
      delete newErrors.nicFrontImage
      delete newErrors.nicBackImage
    }

    if (formData.nicFrontImage && formData.nicBackImage) {
      delete newErrors.passportImage
    }

    delete newErrors.otherSourceOfIncome

    setErrors(newErrors)
    console.log("🚀 ~ handleValidate ~ newErrors:", newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()

    setLoading(true)
    formData.userId = state?.reducer?.userData?.userData?.user?.id

    const isValidated = handleValidate()
    if (isValidated) {
      try {
        await dispatch(kyc(formData))
        router.push(`../../dashboards/analytics/`, undefined, { shallow: true })
      } catch (error) {
        console.error('Error submitting KYC:', error)
        toast.error('Failed to submit KYC')
      } finally {
        setLoading(false)
      }
    } else {
      toast.error('Form is incomplete')
    } 
    setLoading(false)
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
              <Grid item xs={12} sm={5}>
                <Typography variant='subtitle1'>Passport (all quadrangles must be visible)</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box>
                  {previewNicFront === null ? (
                    <>
                      <TextField
                        type='file'
                        name='passportImage'
                        error={!!errors.passportImage}
                        helperText={errors.passportImage}
                        onChange={handleImageUpload}
                      />
                      {previewPassport === null ? (
                        ''
                      ) : (
                        <>
                          <img src={previewPassport} alt='Preview' style={{ maxHeight: '100px' }} />
                          <Button onClick={handleDeletePassportImage}>Delete</Button>
                        </>
                      )}
                    </>
                  ) : (
                    <TextField
                      type='file'
                      label='Passport Image'
                      name='passportImage'
                      onChange={handleImageUpload}
                      disabled
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant='h6' marginTop={3} marginBottom={3}>
                  <b> Note:</b> If you don't have a passport, your ID is allowed. Please take a picture of the front and
                  back
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant='subtitle1'>National ID Card (all quadrangles must be visible)</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box>
                  {previewPassport === null ? (
                    <>
                      <TextField
                        type='file'
                        name='nicFrontImage'
                        error={!!errors.nicFrontImage}
                        helperText={errors.nicFrontImage}
                        onChange={handleImageUpload}
                      />
                      {previewNicFront === null ? (
                        ''
                      ) : (
                        <>
                          <img src={previewNicFront} alt='Preview' style={{ maxHeight: '100px' }} />
                          <Button onClick={handleDeleteNicFrontImage}>Delete</Button>
                        </>
                      )}
                    </>
                  ) : (
                    <TextField type='file' name='nicFrontImage' onChange={handleImageUpload} disabled />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box>
                  <Box>
                    {previewPassport === null ? (
                      <>
                        <TextField
                          type='file'
                          name='nicBackImage'
                          error={!!errors.nicBackImage}
                          helperText={errors.nicBackImage}
                          onChange={handleImageUpload}
                        />
                        {previewNicBack === null ? (
                          ''
                        ) : (
                          <>
                            <img src={previewNicBack} alt='Preview' style={{ maxHeight: '100px' }} />
                            <Button onClick={handleDeleteNicBackImage}>Delete</Button>
                          </>
                        )}
                      </>
                    ) : (
                      <TextField type='file' disabled />
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant='subtitle1'>Signature (Image of your signature)</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    type='file'
                    name='signatureImage'
                    error={!!errors.signatureImage}
                    helperText={errors.signatureImage}
                    onChange={handleImageUpload}
                  />
                  {previewSignature === null ? (
                    ''
                  ) : (
                    <>
                      <img src={previewSignature} alt='Preview' style={{ maxHeight: '100px' }} />
                      <Button onClick={handleDeleteSignature}>Delete</Button>
                    </>
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
