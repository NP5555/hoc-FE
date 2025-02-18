import { createSlice } from '@reduxjs/toolkit'

const area = createSlice({
  name: 'area',
  initialState: {
    areaData: null
  },
  reducers: {
    setArea: (state, action) => {
      state.areaData = action.payload
    }
  }
})

export const { setArea } = area.actions

export default area.reducer
