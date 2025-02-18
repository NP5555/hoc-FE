import { createSlice } from '@reduxjs/toolkit';

const category = createSlice({
  name: 'category',
  initialState: {
    categoryData: null,
  },
  reducers: {
    setCategory: (state, action) => {
      state.categoryData = action.payload;
    },
  },
});

export const { setCategory } = category.actions;

export default category.reducer;
