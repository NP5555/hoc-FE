import { createSlice } from '@reduxjs/toolkit';

const document = createSlice({
  name: 'document',
  initialState: {
    documents: [],
    loading: false,
    error: null
  },
  reducers: {
    setDocument: (state, action) => {
      state.documents = action.payload || [];
      state.loading = false;
      state.error = null;
    },
    setDocumentLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setDocumentError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  },
});

export const { setDocument, setDocumentLoading, setDocumentError } = document.actions;

export default document.reducer;
