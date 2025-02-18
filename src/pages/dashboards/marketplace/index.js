// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import { Button } from '@mui/material'
import Grid from '@mui/material/Grid' //

import LandTable from './land-table'
import RentTable from './rent-table'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchTradeLand } from 'src/store/apps/user'

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
      fetchTradeLand({
        token: state.reducer.userData.userData.token.accessToken,
        page: 1,
        take: 10
      })
    )
  }, [dispatch, state.reducer.userData.userData.token.accessToken])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12} justifyContent='center'>
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
            For Sale
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
