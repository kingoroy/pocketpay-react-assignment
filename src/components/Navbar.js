import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import CONSTS, { AUTH } from '../constants/const';

export default function Navbar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const handleLogout = () => dispatch(logout());
  return (
    <header className="nav">
      <div className="container">
        <div className="brand"><Link to="/" className="brand">PocketPay</Link></div>
        <div className="actions">
          {user ? (
            <button onClick={handleLogout}>{AUTH.BUTTONS.LOGOUT}</button>
          ) : (
            <Link to="/login">{AUTH.BUTTONS.SIGN_IN}</Link>
          )}
        </div>
      </div>
    </header>
  );
}
