import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { policiesAPI, claimsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    totalClaims: 0,
    pendingClaims: 0,
  });
  const [recentPolicies, setRecentPolicies] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch policies
      const policiesResponse = await policiesAPI.getMyPolicies();
      const policies = policiesResponse.data.data;

      // Fetch claims
      const claimsResponse = await claimsAPI.getMyClaims();
      const claims = claimsResponse.data.data;

      // Calculate stats
      const activePolicies = policies.filter(p => p.status === 'ACTIVE').length;
      const pendingClaims = claims.filter(
        c => c.status === 'FILED' || c.status === 'UNDER_REVIEW'
      ).length;

      setStats({
        totalPolicies: policies.length,
        activePolicies,
        totalClaims: claims.length,
        pendingClaims,
      });

      // Get recent items (last 5)
      setRecentPolicies(policies.slice(0, 5));
      setRecentClaims(claims.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Welcome Section */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, {user?.fullName}!</h1>
            <p className="dashboard-subtitle">
              Manage your policies and claims from your dashboard
            </p>
          </div>
          <Link to="/plans" className="btn btn-primary">
            Browse Plans
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-blue">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.totalPolicies}</h3>
              <p className="stat-label">Total Policies</p>
            </div>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.activePolicies}</h3>
              <p className="stat-label">Active Policies</p>
            </div>
          </div>

          <div className="stat-card stat-card-orange">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.totalClaims}</h3>
              <p className="stat-label">Total Claims</p>
            </div>
          </div>

          <div className="stat-card stat-card-purple">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.pendingClaims}</h3>
              <p className="stat-label">Pending Claims</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-sections">
          {/* Recent Policies */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent Policies</h2>
              <Link to="/customer/policies" className="section-link">
                View All →
              </Link>
            </div>

            {recentPolicies.length === 0 ? (
              <div className="empty-state">
                <p>No policies found</p>
                <Link to="/plans" className="btn btn-primary btn-sm">
                  Request Your First Policy
                </Link>
              </div>
            ) : (
              <div className="policies-table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Policy ID</th>
                      <th>Plan Name</th>
                      <th>Coverage</th>
                      <th>Premium</th>
                      <th>Status</th>
                      <th>Start Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPolicies.map((policy) => (
                      <tr key={policy._id}>
                        <td className="policy-id-cell">{policy.policyId}</td>
                        <td>{policy.planName}</td>
                        <td>{formatCurrency(policy.coverageAmount)}</td>
                        <td>
                          {formatCurrency(policy.premiumAmount)}/
                          {policy.premiumFrequency.substring(0, 1)}
                        </td>
                        <td>
                          <span className={`badge ${policy.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                            {policy.status}
                          </span>
                        </td>
                        <td>{formatDate(policy.startDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Claims */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent Claims</h2>
              <Link to="/customer/claims" className="section-link">
                View All →
              </Link>
            </div>

            {recentClaims.length === 0 ? (
              <div className="empty-state">
                <p>No claims found</p>
                <Link to="/customer/file-claim" className="btn btn-secondary btn-sm">
                  File a Claim
                </Link>
              </div>
            ) : (
              <div className="claims-table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Claim ID</th>
                      <th>Policy ID</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Filed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClaims.map((claim) => (
                      <tr key={claim._id}>
                        <td className="claim-id-cell">{claim.claimId}</td>
                        <td className="policy-id-cell">{claim.policyId}</td>
                        <td className="claim-type">{claim.claimType}</td>
                        <td>{formatCurrency(claim.claimAmount)}</td>
                        <td>
                          <span className={`badge ${claim.status === 'APPROVED' || claim.status === 'PAID' ? 'badge-success' : claim.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td>{formatDate(claim.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/plans" className="action-card">
              <div className="action-icon">🔍</div>
              <h3>Browse Plans</h3>
              <p>Explore our insurance plans</p>
            </Link>

            <Link to="/customer/file-claim" className="action-card">
              <div className="action-icon">📝</div>
              <h3>File a Claim</h3>
              <p>Submit a new claim request</p>
            </Link>

            <Link to="/customer/policies" className="action-card">
              <div className="action-icon">📋</div>
              <h3>My Policies</h3>
              <p>View all your policies</p>
            </Link>

            <Link to="/customer/claims" className="action-card">
              <div className="action-icon">📄</div>
              <h3>My Claims</h3>
              <p>Track your claim status</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;