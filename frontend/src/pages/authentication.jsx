import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video, Eye, EyeOff, ArrowLeft, AlertCircle,
  Shield, Zap, Users,
} from 'lucide-react';
import '../styles/auth.css';

export default function Authentication() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Branding Panel */}
      <motion.div
        className="auth-left"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <div className="auth-left-logo-icon">
              <Video size={22} />
            </div>
            Vakyam
          </div>

          <h2>Connect with anyone, anywhere</h2>
          <p>
            Secure video meetings with no downloads required.
            Start or join a meeting in seconds.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Shield size={16} />
              </div>
              End-to-end encrypted video calls
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Zap size={16} />
              </div>
              Low latency, high quality streaming
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Users size={16} />
              </div>
              Screen sharing and live chat
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Form Panel */}
      <div className="auth-right">
        <motion.div
          className="auth-form-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="auth-form-header">
            <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
            <p>
              {isLogin
                ? 'Sign in to continue to your video calls'
                : 'Join us for an amazing video calling experience'}
            </p>
          </div>

          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="auth-username">Username</label>
                <input
                  id="auth-username"
                  className="auth-input"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="auth-toggle">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              className="auth-toggle-link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          <button
            className="auth-back-link"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={14} /> Back to home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
