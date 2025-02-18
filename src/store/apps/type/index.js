import { createSlice } from '@reduxjs/toolkit'

const types = createSlice({
  name: 'types',
  initialState: {
    typesData: null
  },
  reducers: {
    setTypes: (state, action) => {
      state.typesData = action.payload
    }
  }
})

export const { setTypes } = types.actions

export default types.reducer
