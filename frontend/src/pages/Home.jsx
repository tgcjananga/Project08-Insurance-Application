import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Protect Your Future with Ceylinco Life Insurance
            </h1>
            <p className="hero-description">
              Comprehensive life insurance solutions tailored to secure your family's financial future. 
              Choose from our range of flexible plans designed for your needs.
            </p>
            <div className="hero-buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/plans" className="btn btn-primary btn-lg">
                    View Plans
                  </Link>
                  <Link to="/register" className="btn btn-outline btn-lg">
                    Get Started
                  </Link>
                </>
              ) : (
                <Link 
                  to={isAdmin ? '/admin/dashboard' : '/customer/dashboard'} 
                  className="btn btn-primary btn-lg"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Ceylinco Life?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Comprehensive Coverage</h3>
              <p>Wide range of insurance plans to suit every need and budget.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Flexible Premiums</h3>
              <p>Choose monthly, quarterly, or annual payment options with discounts.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick Processing</h3>
              <p>Fast policy approval and claims processing for your convenience.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy Management</h3>
              <p>Manage your policies and claims online, anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="plans-overview-section">
        <div className="container">
          <h2 className="section-title">Our Insurance Plans</h2>
          <div className="plans-overview-grid">
            <div className="plan-overview-card">
              <h3>Term Life Insurance</h3>
              <p>Pure protection for your family with affordable premiums and high coverage.</p>
              <Link to="/plans" className="btn btn-secondary">Learn More</Link>
            </div>

            <div className="plan-overview-card">
              <h3>Savings Plans</h3>
              <p>Build wealth while staying protected with guaranteed returns and bonuses.</p>
              <Link to="/plans" className="btn btn-secondary">Learn More</Link>
            </div>

            <div className="plan-overview-card">
              <h3>Retirement Plans</h3>
              <p>Secure your golden years with pension income and long-term benefits.</p>
              <Link to="/plans" className="btn btn-secondary">Learn More</Link>
            </div>

            <div className="plan-overview-card">
              <h3>Child Education</h3>
              <p>Invest in your child's future education with guaranteed maturity benefits.</p>
              <Link to="/plans" className="btn btn-secondary">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Protect Your Future?</h2>
            <p>Get started today and find the perfect insurance plan for your needs.</p>
            <Link to="/plans" className="btn btn-primary btn-lg">
              Explore Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;