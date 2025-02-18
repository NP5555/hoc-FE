import { createSlice } from '@reduxjs/toolkit'

const land = createSlice({
  name: 'land',
  initialState: {
    land: null
  },
  reducers: {
    setLand: (state, action) => {
      state.land = action.payload
    }
  }
})

export const { setLand } = land.actions

export default land.reducer
