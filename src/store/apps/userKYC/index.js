import { createSlice } from '@reduxjs/toolkit'

const userKYC = createSlice({
  name: 'userKYC',
  initialState: {
    userKYC: null
  },
  reducers: {
    setUserKYC: (state, action) => {
      state.userKYC = action.payload
    }
  }
})

export const { setUserKYC } = userKYC.actions

export default userKYC.reducer
