import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      // Redirect based on role
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="container">
        <div className="auth-wrapper">
          {/* Left Side - Info */}
          <div className="auth-info">
            <h1 className="auth-info-title">Welcome Back!</h1>
            <p className="auth-info-text">
              Login to access your insurance policies, file claims, and manage your account.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-icon">✓</span>
                <span>Manage Policies</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">✓</span>
                <span>File Claims</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">✓</span>
                <span>Track Status</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>Login</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;