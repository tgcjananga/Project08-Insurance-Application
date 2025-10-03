import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import StatsCard from '../../components/admin/StatsCard';
import Loader from '../../components/common/Loader';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const { overview, policyTypeDistribution, recentPolicies, recentClaims } = dashboardData;

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">
              Overview of your insurance management system
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="stats-grid">
          <StatsCard
            title="Total Customers"
            value={overview.totalCustomers}
            icon="👥"
            color="blue"
          />
          <StatsCard
            title="Total Policies"
            value={overview.totalPolicies}
            icon="📋"
            color="green"
            subtitle={`${overview.activePolicies} Active`}
          />
          <StatsCard
            title="Pending Policies"
            value={overview.pendingPolicies}
            icon="⏳"
            color="orange"
            subtitle="Awaiting Approval"
          />
          <StatsCard
            title="Total Claims"
            value={overview.totalClaims}
            icon="📄"
            color="purple"
            subtitle={`${overview.pendingClaims} Pending`}
          />
        </div>

        {/* Revenue Stats */}
        <div className="revenue-section">
          <h2 className="section-title">Financial Overview</h2>
          <div className="revenue-grid">
            <div className="revenue-card">
              <div className="revenue-icon">💰</div>
              <div className="revenue-content">
                <h3 className="revenue-value">
                  {formatCurrency(overview.totalMonthlyRevenue)}
                </h3>
                <p className="revenue-label">Monthly Premium Revenue</p>
              </div>
            </div>

            <div className="revenue-card">
              <div className="revenue-icon">💸</div>
              <div className="revenue-content">
                <h3 className="revenue-value">
                  {formatCurrency(overview.totalApprovedClaims)}
                </h3>
                <p className="revenue-label">Total Approved Claims</p>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Distribution */}
        <div className="distribution-section">
          <h2 className="section-title">Policy Distribution by Type</h2>
          <div className="distribution-grid">
            {policyTypeDistribution.map((item, index) => (
              <div key={index} className="distribution-card">
                <div className="distribution-header">
                  <h3 className="distribution-type">{item._id || 'Unknown'}</h3>
                  <span className="distribution-count">{item.count}</span>
                </div>
                <div className="distribution-bar">
                  <div
                    className="distribution-bar-fill"
                    style={{
                      width: `${(item.count / overview.totalPolicies) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="distribution-percentage">
                  {((item.count / overview.totalPolicies) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="activities-section">
          {/* Recent Policies */}
          <div className="activity-card">
            <div className="activity-header">
              <h2 className="section-title">Recent Policy Requests</h2>
              <Link to="/admin/policies" className="section-link">
                View All →
              </Link>
            </div>

            {recentPolicies.length === 0 ? (
              <div className="empty-state">
                <p>No recent policy requests</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Policy ID</th>
                      <th>Customer</th>
                      <th>Plan</th>
                      <th>Coverage</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPolicies.map((policy) => (
                      <tr key={policy._id}>
                        <td className="policy-id-cell">{policy.policyId}</td>
                        <td>{policy.userId?.fullName || 'N/A'}</td>
                        <td>{policy.planName}</td>
                        <td>{formatCurrency(policy.coverageAmount)}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(policy.status)}`}>
                            {policy.status}
                          </span>
                        </td>
                        <td>{formatDate(policy.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Claims */}
          <div className="activity-card">
            <div className="activity-header">
              <h2 className="section-title">Recent Claims</h2>
              <Link to="/admin/claims" className="section-link">
                View All →
              </Link>
            </div>

            {recentClaims.length === 0 ? (
              <div className="empty-state">
                <p>No recent claims</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Claim ID</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClaims.map((claim) => (
                      <tr key={claim._id}>
                        <td className="claim-id-cell">{claim.claimId}</td>
                        <td>{claim.userId?.fullName || 'N/A'}</td>
                        <td className="claim-type">
                          {claim.claimType.charAt(0).toUpperCase() + 
                           claim.claimType.slice(1).replace('_', ' ')}
                        </td>
                        <td>{formatCurrency(claim.claimAmount)}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(claim.status)}`}>
                            {claim.status.replace('_', ' ')}
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
            <Link to="/admin/policies?status=REQUESTED" className="action-card">
              <div className="action-icon">⏳</div>
              <h3>Review Requests</h3>
              <p>{overview.pendingPolicies} policies awaiting approval</p>
            </Link>

            <Link to="/admin/claims?status=FILED" className="action-card">
              <div className="action-icon">📝</div>
              <h3>Process Claims</h3>
              <p>{overview.pendingClaims} claims to review</p>
            </Link>

            <Link to="/admin/plans" className="action-card">
              <div className="action-icon">➕</div>
              <h3>Manage Plans</h3>
              <p>Add or edit insurance plans</p>
            </Link>

            <Link to="/admin/customers" className="action-card">
              <div className="action-icon">👥</div>
              <h3>View Customers</h3>
              <p>{overview.totalCustomers} registered customers</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;