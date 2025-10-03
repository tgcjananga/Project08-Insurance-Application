import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3 className="footer-title">
              <span className="brand-icon">🛡️</span>
              Ceylinco Life
            </h3>
            <p className="footer-description">
              Protecting your future with comprehensive life insurance solutions. 
              Your trusted partner for financial security.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/plans">Insurance Plans</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-contact">
              <li>📞 +94 11 123 4567</li>
              <li>📧 info@ceylinco.lk</li>
              <li>📍 Colombo, Sri Lanka</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} Ceylinco Life Insurance. All rights reserved.
          </p>
          <p className="footer-note">
            Educational project - Not affiliated with actual Ceylinco Life Insurance
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;