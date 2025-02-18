import { createSlice } from '@reduxjs/toolkit'

const userDocuments = createSlice({
  name: 'userDocuments',
  initialState: {
    userDocumentsData: null
  },
  reducers: {
    setUserDocuments: (state, action) => {
      state.userDocumentsData = action.payload
    }
  }
})

export const { setUserDocuments } = userDocuments.actions

export default userDocuments.reducer
