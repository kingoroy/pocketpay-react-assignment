import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './app/store';
import { login } from './features/auth/authSlice';

// Hydrate auth from localStorage (simple approach)
try {
  const credsRaw = localStorage.getItem('pocketpay_credentials');
  if (credsRaw) {
    const creds = JSON.parse(credsRaw);
    // attempt auto-login using stored credentials; if it fails, clear them
    store.dispatch(login(creds)).unwrap().catch(() => {
      try { localStorage.removeItem('pocketpay_credentials'); localStorage.removeItem('pocketpay_user'); } catch(e) {}
    });
  } else {
    const raw = localStorage.getItem('pocketpay_user');
    if (raw) {
      const user = JSON.parse(raw);
      store.dispatch({ type: 'auth/login/fulfilled', payload: user });
    }
  }
} catch (e) {
  // ignore
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
