import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import URLs from '../apiRoutes';

export const fetchWallets = createAsyncThunk('wallets/fetchAll', async (userId) => {
  const res = await api.get(URLs.WALLETS, { params: { userId } });
  return res.data;
});

const walletsSlice = createSlice({
  name: 'wallets',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallets.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchWallets.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload || []; })
      .addCase(fetchWallets.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; });
  }
});

export default walletsSlice.reducer;
