import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import URLs from '../apiRoutes';

export const fetchTransactions = createAsyncThunk('transactions/fetchAll', async (userId) => {
  const res = await api.get(URLs.TRANSACTIONS, { params: { userId } });
  return res.data;
});

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.status = 'loading'; })
  .addCase(fetchTransactions.fulfilled, (state, action) => { state.status = 'succeeded'; state.list = action.payload || []; })
      .addCase(fetchTransactions.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; });
  }
});

export default transactionsSlice.reducer;
