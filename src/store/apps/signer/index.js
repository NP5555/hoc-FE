import { createSlice } from '@reduxjs/toolkit'

const signer = createSlice({
  name: 'signer',
  initialState: {
    signer: null
  },
  reducers: {
    setSigner: (state, action) => {
      state.signer = action.payload
    }
  }
})

export const { setSigner } = signer.actions

export default signer.reducer
