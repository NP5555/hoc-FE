import { createSlice } from '@reduxjs/toolkit'

const requestDoc = createSlice({
  name: 'requestDoc',
  initialState: {
    requestDoc: {
      data: [],
      meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 }
    },
    loading: false,
    error: null
  },
  reducers: {
    setRequestDocument: (state, action) => {
      state.requestDoc = action.payload || {
        data: [],
        meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 }
      };
      state.loading = false;
      state.error = null;
    },
    setRequestDocumentLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setRequestDocumentError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      // Keep existing data if there's an error
    }
  }
})

export const { setRequestDocument, setRequestDocumentLoading, setRequestDocumentError } = requestDoc.actions

export default requestDoc.reducer
