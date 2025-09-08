import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import CONSTS, { VALIDATION, AUTH, UI } from '../constants/const';
import { useNavigate } from 'react-router-dom';
import '../styles/main.scss';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const navigate = useNavigate();
  const goToSignup = () => navigate('/signup');

  const validateEmail = (val) => {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRx.test(val);
  };
  const handleEmailChange = (e) => {
    const v = e.target.value;
    setEmail(v);
  setErrors(prev => ({ ...prev, email: validateEmail(v) ? null : VALIDATION.EMAIL_INVALID }));
  };
  const handlePasswordChange = (e) => {
    const v = e.target.value;
    setPassword(v);
  setErrors(prev => ({ ...prev, password: v ? null : VALIDATION.PASSWORD_REQUIRED }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  const errs = {};
  if (!validateEmail(email)) errs.email = VALIDATION.EMAIL_INVALID;
  if (!password) errs.password = VALIDATION.PASSWORD_REQUIRED;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    dispatch(login({ email, password }));
  };
  // redirect when authenticated
  React.useEffect(() => {
    if (auth.user) navigate('/dashboard');
  }, [auth.user, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
  <h2>{AUTH.TITLES.LOGIN}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={handleEmailChange} placeholder={UI.PLACEHOLDERS.EMAIL} />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={handlePasswordChange} placeholder={UI.PLACEHOLDERS.PASSWORD_DOTS} />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          <div className="mt-1">
            <button className="primary-btn" type="submit">{AUTH.BUTTONS.SIGN_IN}</button>
          </div>
          <div className="mt-1 text-center">
            <p>{AUTH.PROMPTS.DONT_HAVE_ACCOUNT}</p>
            <button className="secondary-btn" type="button" onClick={goToSignup}>{AUTH.BUTTONS.SIGN_UP}</button>
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
