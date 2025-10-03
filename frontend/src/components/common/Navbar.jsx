import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🛡️</span>
            <span className="brand-text">Ceylinco Life</span>
          </Link>

          {/* Navigation Links */}
          <div className="navbar-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/plans" className="nav-link">Plans</Link>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {isAdmin ? (
                  <>
                    <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/admin/policies" className="nav-link">Policies</Link>
                    <Link to="/admin/claims" className="nav-link">Claims</Link>
                    <Link to="/admin/customers" className="nav-link">Customers</Link>
                  </>
                ) : (
                  <>
                    <Link to="/customer/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/customer/policies" className="nav-link">My Policies</Link>
                    <Link to="/customer/claims" className="nav-link">My Claims</Link>
                  </>
                )}

                <div className="navbar-user">
                  <span className="user-name">{user?.fullName}</span>
                  <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;