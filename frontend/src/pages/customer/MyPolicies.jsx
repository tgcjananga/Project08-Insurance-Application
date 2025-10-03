import { useState, useEffect } from 'react';
import { policiesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import PolicyCard from '../../components/customer/PolicyCard';
import Loader from '../../components/common/Loader';
import './MyPolicies.css';

const MyPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, [filter]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const response = await policiesAPI.getMyPolicies(params);
      setPolicies(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch policies');
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-policies-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Policies</h1>
          <p className="page-description">
            View and manage all your insurance policies
          </p>
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

        {/* Policies Grid */}
        {loading ? (
          <Loader />
        ) : policies.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📋</div>
            <h3>No Policies Found</h3>
            <p>You don't have any policies yet. Start by browsing our plans.</p>
          </div>
        ) : (
          <div className="policies-grid">
            {policies.map((policy) => (
              <PolicyCard key={policy._id} policy={policy} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPolicies;