import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>('user@example.com');
  const [email, setEmail] = useState<string>('user@example.com');
  const [password, setPassword] = useState<string>('strongPassword123');
  const [confirmPassword, setConfirmPassword] = useState<string>('strongPassword123');
  const [passwordError, setPasswordError] = useState<string>('');
  const { register, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    clearError();
    setPasswordError('');

    if (!username || !email || !password || !confirmPassword) {
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await register(username, email, password);
    navigate('/');
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h2 className="register-title">Create your account</h2>
          <p className="register-subtitle">
            Or{' '}
            <Link to="/login" className="register-link">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="form-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password" className="sr-only">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="form-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {(passwordError || error) && (
            <div className="error-message">
              <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{passwordError || error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register; 