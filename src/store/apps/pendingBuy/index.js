import { createSlice } from '@reduxjs/toolkit'

const pendingBuy = createSlice({
  name: 'pendingBuy',
  initialState: {
    pendingBuyData: null
  },
  reducers: {
    setPendingBuy: (state, action) => {
      state.pendingBuyData = action.payload
    }
  }
})

export const { setPendingBuy } = pendingBuy.actions

export default pendingBuy.reducer
