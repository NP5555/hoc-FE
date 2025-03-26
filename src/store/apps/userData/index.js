import { createSlice } from '@reduxjs/toolkit';

const userData = createSlice({
  name: 'userData',
  initialState: {
    userData: null,
  },
  reducers: {
    setUserData: (state, action) => {
      if (action.payload) {
        console.log('Setting userData in store:', action.payload);
        state.userData = action.payload;
      }
    },
  },
});

export const { setUserData } = userData.actions;

export default userData.reducer;
