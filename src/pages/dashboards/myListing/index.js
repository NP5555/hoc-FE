// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid' //

import LandTable from './saleTable'
import RentTable from './rentTable'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchTradeLandByUserId } from 'src/store/apps/user'
import { Button } from '@mui/material'

const LandList = () => {
  const [selectedTab, setSelectedTab] = useState('land')
  const defaultColor = '#7367F0'

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  const handleButtonClick = tab => {
    setSelectedTab(tab)
  }

  useEffect(() => {
    dispatch(
      fetchTradeLandByUserId({
        token: state.reducer.userData.userData.token.accessToken,
        userId: state?.reducer?.userData?.userData?.user?.id,
        page: 1,
        take: 10
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card align='center' style={{ padding: '20px 20px' }}>
          <Button
            variant='contained'
            style={{
              width: '150px',
              marginRight: '10px',
              backgroundColor: selectedTab === 'land' ? '#EA5455' : defaultColor
            }}
            onClick={() => handleButtonClick('land')}
          >
            Sale
          </Button>
          <Button
            variant='contained'
            style={{
              width: '150px',
              marginLeft: '10px',
              backgroundColor: selectedTab === 'rent' ? '#EA5455' : defaultColor
            }}
            onClick={() => handleButtonClick('rent')}
          >
            Rent
          </Button>
        </Card>
        <Card>
          {selectedTab === 'land' && <LandTable />}
          {selectedTab === 'rent' && <RentTable />}
        </Card>
      </Grid>
    </Grid>
  )
}

export default LandList
