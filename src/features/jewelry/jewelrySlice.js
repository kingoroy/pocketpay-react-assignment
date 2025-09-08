import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import URLs from '../apiRoutes';

export const fetchJewelry = createAsyncThunk('jewelry/fetchAll', async (userId) => {
  // server supports grouped collections; pass userId as query so server returns only user's items
  const res = await api.get(URLs.JEWELRY, { params: { userId } });
  return res.data;
});

export const addJewelry = createAsyncThunk('jewelry/add', async ({ userId, data }) => {
  // include userId so server can insert into grouped collection
  const body = { ...data, userId };
  const res = await api.post(URLs.JEWELRY, body);
  return res.data;
});

export const updateJewelry = createAsyncThunk('jewelry/update', async ({ id, data, userId }) => {
  // include userId to help server identify grouped location if needed
  const body = { ...data, userId };
  const res = await api.put(`${URLs.JEWELRY}/${id}`, body);
  return res.data;
});

export const deleteJewelry = createAsyncThunk('jewelry/delete', async ({ id, userId }) => {
  // pass userId as query param to help grouped servers if implemented
  await api.delete(`${URLs.JEWELRY}/${id}`, { params: { userId } });
  return id;
});

const jewelrySlice = createSlice({
  name: 'jewelry',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJewelry.pending, (state) => { state.status = 'loading'; })
  .addCase(fetchJewelry.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload || []; })
      .addCase(fetchJewelry.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
      .addCase(addJewelry.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateJewelry.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteJewelry.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  }
});

export default jewelrySlice.reducer;
