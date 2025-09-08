import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJewelry } from '../features/jewelry/jewelrySlice';
import { fetchTransactions } from '../features/transactions/transactionsSlice';
import { fetchWallets } from '../features/wallets/walletsSlice';
import '../styles/main.scss';
import JewelryList from '../components/JewelryList';
import { UI } from '../constants/const';

export default function Dashboard() {
  const dispatch = useDispatch();
  const auth = useSelector(s => s.auth);
  const transactions = useSelector(s => s.transactions.list);
  const jewelryItems = useSelector(s => s.jewelry.items || []);
  const wallets = useSelector(s => s.wallets.items || []);

  useEffect(() => {
    if (auth && auth.user && auth.user.id) {
      dispatch(fetchJewelry(auth.user.id));
      dispatch(fetchTransactions(auth.user.id));
  dispatch(fetchWallets(auth.user.id));
    }
  }, [dispatch, auth.user]);

  return (
    <div className="container dashboard">
      <div className="hero">
        <div>
          <h2>Welcome{auth.user ? `, ${auth.user.name}` : ''}</h2>
          <p className="muted">Overview of your account activity</p>
        </div>
        <div className="cards">
          <div className="card">
            <h4>{UI.TITLES.WALLET_BALANCE}</h4>
            <div className="value">{(wallets && wallets.length && wallets[0].balance) || auth.user?.wallet?.balance || '$0'}</div>
          </div>
          <div className="card">
            <h4>{UI.TITLES.JEWELRY_ITEMS}</h4>
            <div className="value">{jewelryItems.length}</div>
          </div>
        </div>
      </div>

    <div className="grid">
        <div>
      <div className="panel transactions-list">
            <h3>{UI.TITLES.RECENT_TRANSACTIONS}</h3>
            <ul>
              {transactions.slice(0,6).map(tx => (
                <li key={tx.id}><span>{tx.date}</span><span>{tx.description}</span><strong>{tx.amount}</strong></li>
              ))}
            </ul>
          </div>

          <div className="mt-2 panel">
            <h3>{UI.TITLES.YOUR_JEWELRY}</h3>
            <JewelryList />
          </div>
        </div>

        <aside>
          <div className="panel">
            <h4>Account</h4>
            <div className="muted-2">{auth.user ? auth.user.email : 'Not signed in'}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
