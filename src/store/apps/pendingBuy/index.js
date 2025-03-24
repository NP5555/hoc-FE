import { createSlice } from '@reduxjs/toolkit'

const pendingBuy = createSlice({
  name: 'pendingBuy',
  initialState: {
    pendingBuyData: {
      data: [],
      meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 }
    },
    loading: false,
    error: null
  },
  reducers: {
    setPendingBuy: (state, action) => {
      state.pendingBuyData = action.payload || {
        data: [],
        meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 }
      };
      state.loading = false;
      state.error = null;
    },
    setPendingBuyLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setPendingBuyError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      // Maintain existing data if there's an error
    }
  }
})

export const { setPendingBuy, setPendingBuyLoading, setPendingBuyError } = pendingBuy.actions

export default pendingBuy.reducer
