import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Container, TextField, Button, CircularProgress } from '@mui/material'
import toast from 'react-hot-toast'
import { BASE_URL_API } from 'src/configs/const'

const Newsletter = () => {
  const [news, setNews] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const state = useSelector(state => state)

  const handleInputChange = event => {
    setNews(event.target.value)
  }

  const handleFormSubmit = async event => {
    event.preventDefault()
    try {
      setIsLoading(true)
      if (news.length === 0) {
        toast.error('Please enter the news')

        return null
      }

      let data = {
        token: state.reducer.userData.userData.token.accessToken,
        data: {
          news: news
        }
      }

      let response = await fetch(`${BASE_URL_API}/newsletter/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        },
        body: JSON.stringify(data.data)
      })
      response = await response.json()
      if (response.status === 200) {
        setNews('')
        toast.success(response.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxWidth='sm' style={{ textAlign: 'center', marginTop: '50px' }}>
      <form onSubmit={handleFormSubmit}>
        <div>
          <TextField
            label='News '
            variant='outlined'
            multiline
            rows={10}
            value={news}
            onChange={handleInputChange}
            fullWidth
          />
        </div>
        {isLoading ? (
          <Button variant='contained' color='primary' style={{ marginTop: '16px' }} disabled>
            <CircularProgress color='inherit' size={28} />
          </Button>
        ) : (
          <Button type='submit' variant='contained' color='primary' style={{ marginTop: '16px' }}>
            Send News
          </Button>
        )}
      </form>
    </Container>
  )
}

export default Newsletter
