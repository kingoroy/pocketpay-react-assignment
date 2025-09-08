import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import URLs from '../apiRoutes';
import { fetchJewelry } from '../jewelry/jewelrySlice';
import { fetchTransactions } from '../transactions/transactionsSlice';
import { fetchWallets } from '../wallets/walletsSlice';


export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
  // use frontend auth endpoint path '/login' (server proxy / rewrite handles actual path)
  const res = await api.post(URLs.LOGIN, credentials);
  // successful response should contain { user }
  if (res.status === 200 && res.data && res.data.user) {
    const user = res.data.user;
    // after login, fetch user-specific data into store
    try {
      if (thunkAPI && thunkAPI.dispatch) {
  thunkAPI.dispatch(fetchJewelry(user.id));
  thunkAPI.dispatch(fetchTransactions(user.id));
  thunkAPI.dispatch(fetchWallets(user.id));
        // try fetching wallets (may return grouped or flat)
        // we don't have a wallets slice; store wallet on user if present
        try {
          api.get(URLs.WALLETS, { params: { userId: user.id } }).then(r => {
            // if returned array and has items, attach to user object in localStorage
            if (r && r.data) {
              try {
                const stored = JSON.parse(localStorage.getItem('pocketpay_user') || 'null') || {};
                stored.wallets = r.data;
                localStorage.setItem('pocketpay_user', JSON.stringify(stored));
              } catch(e){}
            }
          }).catch(()=>{});
        } catch (e) {}
      }
    } catch (e) {}
    return user;
  }
  return thunkAPI.rejectWithValue({ code: 'LOGIN_ERROR', message: res.data?.message || 'Login failed' });
  } catch (e) {
    // prefer server-provided error payload when available
    const server = e && e.response && e.response.data;
    if (server && typeof server === 'object') return thunkAPI.rejectWithValue(server);
    return thunkAPI.rejectWithValue({ code: 'LOGIN_ERROR', message: e.message || 'Login failed' });
  }
});

export const signup = createAsyncThunk('auth/signup', async (payload, thunkAPI) => {
  try {
  // call signup endpoint
  const res = await api.post(URLs.SIGNUP, payload);
  if ((res.status === 200 || res.status === 201) && res.data && res.data.user) return res.data.user;
  return thunkAPI.rejectWithValue({ code: 'SIGNUP_ERROR', message: res.data?.message || 'Signup failed' });
  } catch (e) {
  const server = e && e.response && e.response.data;
  if (server && typeof server === 'object') return thunkAPI.rejectWithValue(server);
  return thunkAPI.rejectWithValue({ code: 'SIGNUP_ERROR', message: e.message || 'Signup failed' });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'idle', error: null, errorCode: null },
  reducers: {
    logout(state) {
  state.user = null;
  try{ localStorage.removeItem('pocketpay_user'); localStorage.removeItem('pocketpay_credentials'); }catch(e){}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null; state.errorCode = null; })
    .addCase(login.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.user = action.payload;
          try{
            localStorage.setItem('pocketpay_user', JSON.stringify(action.payload));
            // save credentials if provided (meta.arg contains the original credentials)
            if (action.meta && action.meta.arg) {
              localStorage.setItem('pocketpay_credentials', JSON.stringify(action.meta.arg));
            }
          }catch(e){}
        })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        // action.payload can be { code, message } or a string
        if (action.payload && typeof action.payload === 'object') {
          state.errorCode = action.payload.code || null;
          state.error = action.payload.message || null;
        } else {
          state.error = action.payload || action.error?.message;
          state.errorCode = null;
        }
      })
      .addCase(signup.pending, (state) => { state.status = 'loading'; state.error = null; state.errorCode = null; })
      .addCase(signup.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.user = action.payload;
            try{
              localStorage.setItem('pocketpay_user', JSON.stringify(action.payload));
              if (action.meta && action.meta.arg) {
                localStorage.setItem('pocketpay_credentials', JSON.stringify(action.meta.arg));
              }
            }catch(e){}
          })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload && typeof action.payload === 'object') {
          state.errorCode = action.payload.code || null;
          state.error = action.payload.message || null;
        } else {
          state.error = action.payload || action.error?.message;
          state.errorCode = null;
        }
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
