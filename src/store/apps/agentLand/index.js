import { createSlice } from '@reduxjs/toolkit'

const agentLand = createSlice({
  name: 'agentLand',
  initialState: {
    agentLandData: null
  },
  reducers: {
    setAgentLand: (state, action) => {
      state.agentLandData = action.payload
    }
  }
})

export const { setAgentLand } = agentLand.actions

export default agentLand.reducer
