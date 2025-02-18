import { createSlice } from '@reduxjs/toolkit'

const requestDoc = createSlice({
  name: 'requestDoc',
  initialState: {
    requestDoc: null
  },
  reducers: {
    setRequestDocument: (state, action) => {
      state.requestDoc = action.payload
    }
  }
})

export const { setRequestDocument } = requestDoc.actions

export default requestDoc.reducer
