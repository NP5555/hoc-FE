import { createSlice } from '@reduxjs/toolkit';

const document = createSlice({
  name: 'document',
  initialState: {
    documents: null,
  },
  reducers: {
    setDocument: (state, action) => {
      state.documents = action.payload;
    },
  },
});

export const { setDocument } = document.actions;

export default document.reducer;
