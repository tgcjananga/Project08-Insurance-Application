import { useState, useEffect } from 'react';
import { policiesAPI } from '../../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import './ManagePolicies.css';

const ManagePolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchPolicies();
  }, [filter]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const response = await policiesAPI.getAll(params);
      setPolicies(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch policies');
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (policyId) => {
    try {
      setActionLoading({ ...actionLoading, [policyId]: true });
      await policiesAPI.approve(policyId);
      toast.success('Policy approved successfully');
      fetchPolicies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve policy');
    } finally {
      setActionLoading({ ...actionLoading, [policyId]: false });
    }
  };

  const handleReject = async (policyId) => {
    if (!window.confirm('Are you sure you want to reject this policy request?')) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [policyId]: true });
      await policiesAPI.reject(policyId);
      toast.success('Policy rejected');
      fetchPolicies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject policy');
    } finally {
      setActionLoading({ ...actionLoading, [policyId]: false });
    }
  };

  const handleUpdateStatus = async (policyId, newStatus) => {
    try {
      setActionLoading({ ...actionLoading, [policyId]: true });
      await policiesAPI.updateStatus(policyId, newStatus);
      toast.success(`Policy status updated to ${newStatus}`);
      fetchPolicies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading({ ...actionLoading, [policyId]: false });
    }
  };

  return (
    <div className="manage-policies-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Policies</h1>
            <p className="page-description">
              Review and manage all insurance policy requests
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="policies-filter">
          <label htmlFor="statusFilter" className="filter-label">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Policies</option>
            <option value="REQUESTED">Requested</option>
            <option value="ACTIVE">Active</option>
            <option value="LAPSED">Lapsed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="MATURED">Matured</option>
          </select>
        </div>

        {/* Policies Table */}
        {loading ? (
          <Loader />
        ) : policies.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📋</div>
            <h3>No Policies Found</h3>
            <p>No policies match your filter criteria.</p>
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
                  <th>Premium</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy._id}>
                    <td className="policy-id-cell">{policy.policyId}</td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">
                          {policy.userId?.fullName || 'N/A'}
                        </span>
                        <span className="customer-email">
                          {policy.userId?.email || ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="plan-info">
                        <span className="plan-name">{policy.planName}</span>
                        <span className="plan-type">{policy.planType}</span>
                      </div>
                    </td>
                    <td>{formatCurrency(policy.coverageAmount)}</td>
                    <td>
                      {formatCurrency(policy.premiumAmount)}/
                      {policy.premiumFrequency.substring(0, 1)}
                    </td>
                    <td>{formatDate(policy.startDate)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(policy.status)}`}>
                        {policy.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {policy.status === 'REQUESTED' && (
                          <>
                            <button
                              onClick={() => handleApprove(policy._id)}
                              className="btn btn-success btn-sm"
                              disabled={actionLoading[policy._id]}
                            >
                              {actionLoading[policy._id] ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(policy._id)}
                              className="btn btn-danger btn-sm"
                              disabled={actionLoading[policy._id]}
                            >
                              {actionLoading[policy._id] ? '...' : 'Reject'}
                            </button>
                          </>
                        )}
                        {policy.status === 'ACTIVE' && (
                          <select
                            onChange={(e) => handleUpdateStatus(policy._id, e.target.value)}
                            className="status-select"
                            disabled={actionLoading[policy._id]}
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Change Status
                            </option>
                            <option value="LAPSED">Mark as Lapsed</option>
                            <option value="CANCELLED">Cancel</option>
                            <option value="MATURED">Mark as Matured</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePolicies;