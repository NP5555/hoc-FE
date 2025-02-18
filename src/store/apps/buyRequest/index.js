import { createSlice } from '@reduxjs/toolkit'

const buyRequest = createSlice({
  name: 'buyRequest',
  initialState: {
    buyRequestData: null
  },
  reducers: {
    setBuyRequest: (state, action) => {
      state.buyRequestData = action.payload
    }
  }
})

export const { setBuyRequest } = buyRequest.actions

export default buyRequest.reducer
