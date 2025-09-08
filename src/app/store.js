import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import jewelryReducer from '../features/jewelry/jewelrySlice';
import transactionsReducer from '../features/transactions/transactionsSlice';
import walletsReducer from '../features/wallets/walletsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jewelry: jewelryReducer,
    transactions: transactionsReducer,
  wallets: walletsReducer,
  },
});

export default store;
