import { useRouter } from 'next/router'
import {
  TextField,
  Button,
  Grid,
  Typography,
  Container,
  Box,
  Dialog,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material'
import { MuiTelInput } from 'mui-tel-input'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from 'src/views/spinner'
import { fetchUserKycById } from 'src/store/apps/user'
import { updateKycStatus } from 'src/store/apps/user'

const ImagePreviewCell = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  '& img': {
    maxHeight: '100px',
    maxWidth: '100%',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: theme.shadows[4]
    }
  }
}))

const StyledImage = styled('img')({
  width: '100%',
  height: 'auto',
  display: 'block',
  borderRadius: '4px'
})

const ImagePreviewModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '80%',
    maxHeight: '80%',
    margin: 'auto',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden'
  }
}))

const UserKycPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const state = useSelector(state => state)

  const router = useRouter()
  const { userId } = router.query
  const dispatch = useDispatch()

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }
console.log(state)

  const loadData = () => {
    if (!state?.reducer?.kyc?.kyc) {
      return <Spinner />
    } else if (state?.reducer?.kyc?.kyc === '') {
    } else if (state?.reducer?.userData?.userData?.user?.role !== 'ADMIN') {
      return (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          You are not authorized
        </Typography>
      )
    } else setData(state?.reducer?.kyc?.kyc?.data)
  }

  useEffect(() => {
    loadData()
  }, [state?.reducer?.kyc?.kyc])

  useEffect(() => {
    if (userId) {
      dispatch(
        fetchUserKycById({
          token: state.reducer.userData.userData.token.accessToken,
          page: 1,
          take: 10,
          userId: userId
        })
      )
    }
  }, [dispatch, state.reducer.userData.userData.token.accessToken, userId])

  const handleSubmit = async (event, rowId, newStatus) => {
    try {
      setLoading(true)

      let data = {
        token: state.reducer.userData.userData.token.accessToken,
        id: rowId,
        status: newStatus
      }
      await dispatch(updateKycStatus(data))
      router.push(`dashboards/analytics/`, undefined, { shallow: true })
    } catch (error) {
      console.log('🚀 ~ file: index.js:73 ~ handleKYC ~ error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!data || data.length === 0 ? (
        <>
          <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
            No Record Found
          </Typography>
        </>
      ) : (
        <>
          {data.slice().map(row => (
            <>
              <Container maxWidth='md'>
                <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
                  <Typography variant='h4' component='h1' gutterBottom>
                    KYC
                    {row.status === 'pending' ? (
                      <Chip sx={{ marginLeft: 4 }} label={row.status.toUpperCase()} color='primary' />
                    ) : row.status === 'rejected' ? (
                      <Chip sx={{ marginLeft: 4 }} label={row.status.toUpperCase()} color='error' />
                    ) : (
                      <Chip sx={{ marginLeft: 4 }} label={row.status.toUpperCase()} color='success' />
                    )}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={2}>
                    <Typography variant='subtitle1'>Name:</Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField value={row.firstName} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField value={row.lastName} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant='subtitle1'>Email:</Typography>
                  </Grid>
                  <Grid item xs={12} sm={10}>
                    <TextField value={row.email} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant='subtitle1'>Address:</Typography>
                  </Grid>
                  <Grid item xs={12} sm={10}>
                    <TextField value={row.address} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={2}></Grid>
                  <Grid item xs={12} sm={10}>
                    <TextField value={row.street} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={2}></Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField value={row.state} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField value={row.postalCode} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant='subtitle1'>Mobile Number:</Typography>
                  </Grid>
                  <Grid item xs={12} sm={10}>
                    <MuiTelInput value={row.mobileNumber} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant='subtitle1'>Company:</Typography>
                  </Grid>
                  <Grid item xs={12} sm={10}>
                    <TextField value={row.company} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant='subtitle1'>Walet Address:</Typography>
                  </Grid>
                  <Grid item xs={12} sm={10}>
                    <TextField value={row.pubkey} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant='subtitle1'>No. of Certificates:</Typography>
                  </Grid>
                  <Grid item xs={12} sm={10}>
                    <TextField value={row.certificates} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Typography variant='subtitle1'>Experience in investing</Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField value={row.experience} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Typography variant='subtitle1'>Source of income ?</Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField value={row.sourceOfIncome} fullWidth disabled />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Typography variant='subtitle1'>Risk profile</Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField value={row.riskProfile} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  {row.isPassport ? (
                    <>
                      <Grid item xs={12} sm={5}>
                        <Typography variant='subtitle1'>Passport Image</Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box>
                          <ImagePreviewCell onClick={toggleModal}>
                            <StyledImage src={row.passportImage} alt='Preview' />
                          </ImagePreviewCell>
                          <ImagePreviewModal open={isModalOpen} onClose={toggleModal}>
                            <StyledImage src={row.passportImage} alt='Full Preview' />
                          </ImagePreviewModal>
                        </Box>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} sm={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <Typography variant='subtitle1'>National ID Card</Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box>
                          <ImagePreviewCell onClick={toggleModal}>
                            <StyledImage src={row.nicFrontImage} alt='Preview' />
                          </ImagePreviewCell>
                          <ImagePreviewModal open={isModalOpen} onClose={toggleModal}>
                            <StyledImage src={row.nicFrontImage} alt='Full Preview' />
                          </ImagePreviewModal>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box>
                          <Box>
                            <ImagePreviewCell onClick={toggleModal}>
                              <StyledImage src={row.nicBackImage} alt='Preview' />
                            </ImagePreviewCell>
                            <ImagePreviewModal open={isModalOpen} onClose={toggleModal}>
                              <StyledImage src={row.nicBackImage} alt='Full Preview' />
                            </ImagePreviewModal>
                          </Box>
                        </Box>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Typography variant='subtitle1'>Signature (Image of your signature)</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      {/* <ImagePreviewCell onClick={toggleModal}>
                        <StyledImage src={row.signatureImage} alt='Preview' />
                      </ImagePreviewCell>
                      <ImagePreviewModal open={isModalOpen} onClose={toggleModal}>
                        <StyledImage src={row.signatureImage} alt='Full Preview' />
                      </ImagePreviewModal> */}
                    </Box>
                    <c>
                      <img src={row.signatureImage} alt='Preview' style={{ maxWidth: '200px' }} />
                    </c>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider />
                  </Grid>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Grid item xs={12} marginTop={3} marginBottom={6} textAlign={'center'}>
                      {row.status === 'approved' ? (
                        <Button
                          type='submit'
                          variant='contained'
                          color='error'
                          sx={{ marginLeft: 4 }}
                          onClick={event => handleSubmit(event, row.id, 'rejected')}
                        >
                          Block
                        </Button>
                      ) : (
                        <>
                          <Button
                            type='submit'
                            variant='contained'
                            color='success'
                            onClick={event => handleSubmit(event, row.id, 'approved')}
                          >
                            Accept
                          </Button>
                          <Button
                            type='submit'
                            variant='contained'
                            color='error'
                            sx={{ marginLeft: 4 }}
                            onClick={event => handleSubmit(event, row.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </Grid>
                  )}
                </Grid>
              </Container>
            </>
          ))}
        </>
      )}
    </>
  )
}

export default UserKycPage
