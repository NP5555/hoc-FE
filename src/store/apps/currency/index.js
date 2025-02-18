import { createSlice } from '@reduxjs/toolkit';

const currency = createSlice({
  name: 'currency',
  initialState: {
    currencyData: null,
  },
  reducers: {
    setCurrency: (state, action) => {
      state.currencyData = action.payload;
    },
  },
});

export const { setCurrency } = currency.actions;

export default currency.reducer;
