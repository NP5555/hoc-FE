import { createSlice } from '@reduxjs/toolkit'

const userKycById = createSlice({
  name: 'userKycById',
  initialState: {
    userKycById: null
  },
  reducers: {
    setUserKycById: (state, action) => {
      state.userKycById = action.payload
    }
  }
})

export const { setUserKycById } = userKycById.actions

export default userKycById.reducer
