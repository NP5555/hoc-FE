import { createSlice } from '@reduxjs/toolkit'

const trade = createSlice({
  name: 'trade',
  initialState: {
    trade: null
  },
  reducers: {
    setTrade: (state, action) => {
      state.trade = action.payload
    }
  }
})

export const { setTrade } = trade.actions

export default trade.reducer
