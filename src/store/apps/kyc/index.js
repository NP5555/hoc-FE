import { createSlice } from '@reduxjs/toolkit'

const kyc = createSlice({
  name: 'kyc',
  initialState: {
    kyc: null
  },
  reducers: {
    setKyc: (state, action) => {
      state.kyc = action.payload
    }
  }
})

export const { setKyc } = kyc.actions

export default kyc.reducer
