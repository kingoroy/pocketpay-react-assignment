import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../features/auth/authSlice';
import CONSTS, { VALIDATION, AUTH, UI } from '../constants/const';
import { useNavigate } from 'react-router-dom';
import '../styles/main.scss';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const auth = useSelector(s => s.auth);
  const navigate = useNavigate();
  const goToLogin = () => navigate('/login');

  const handleSubmit = (e) => {
    e.preventDefault();
  const errs = {};
  if (!name.trim()) errs.name = 'Name is required';
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name.trim()) errs.name = VALIDATION.NAME_REQUIRED;
  if (!emailRx.test(email)) errs.email = VALIDATION.EMAIL_INVALID;
  if (!password || password.length < 6) errs.password = VALIDATION.PASSWORD_LENGTH;
  setErrors(errs);
  if (Object.keys(errs).length) return;
  dispatch(signup({ name, email, password }));
  };
  const handleNameChange = (e) => { const v = e.target.value; setName(v); setErrors(prev => ({ ...prev, name: v.trim() ? null : VALIDATION.NAME_REQUIRED })); };
  const handleEmailChange = (e) => { const v = e.target.value; setEmail(v); const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; setErrors(prev => ({ ...prev, email: emailRx.test(v) ? null : VALIDATION.EMAIL_INVALID })); };
  const handlePasswordChange = (e) => { const v = e.target.value; setPassword(v); setErrors(prev => ({ ...prev, password: (v && v.length >= 6) ? null : VALIDATION.PASSWORD_LENGTH })); };
  React.useEffect(() => {
    if (auth.user) navigate('/dashboard');
  }, [auth.user, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
  <h2>{AUTH.TITLES.SIGNUP}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={handleNameChange} placeholder={UI.PLACEHOLDERS.FULL_NAME} />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={handleEmailChange} placeholder={UI.PLACEHOLDERS.EMAIL} />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={handlePasswordChange} placeholder={UI.PLACEHOLDERS.PASSWORD} />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          <div className="mt-1">
            <button className="primary-btn" type="submit">{AUTH.BUTTONS.CREATE_ACCOUNT}</button>
          </div>
          <div className="mt-1 text-center">
            <p>{AUTH.PROMPTS.ALREADY_HAVE}</p>
            <button className="secondary-btn" type="button" onClick={goToLogin}>{AUTH.BUTTONS.SIGN_IN}</button>
          </div>
          {auth.error && (
            <div className={`error ${auth.errorCode ? 'error--' + auth.errorCode : ''}`} role="alert">
              {auth.error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
