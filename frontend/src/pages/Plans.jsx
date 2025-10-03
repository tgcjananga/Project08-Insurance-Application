import { useState, useEffect } from 'react';
import { plansAPI } from '../services/api';
import { toast } from 'react-toastify';
import PlanCard from '../components/customer/PlanCard';
import Loader from '../components/common/Loader';
import './Plans.css';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    planType: '',
    search: '',
  });
  const [planTypes, setPlanTypes] = useState([]);

  useEffect(() => {
    fetchPlanTypes();
    fetchPlans();
  }, [filters]);

  const fetchPlanTypes = async () => {
    try {
      const response = await plansAPI.getTypes();
      setPlanTypes(response.data.data);
    } catch (error) {
      console.error('Error fetching plan types:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await plansAPI.getAll(filters);
      setPlans(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch plans');
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      planType: '',
      search: '',
    });
  };

  return (
    <div className="plans-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Insurance Plans</h1>
          <p className="page-description">
            Choose from our comprehensive range of life insurance plans designed to protect your future.
          </p>
        </div>

        {/* Filters */}
        <div className="plans-filters">
          <div className="filter-group">
            <label htmlFor="planType" className="filter-label">
              Plan Type
            </label>
            <select
              id="planType"
              name="planType"
              value={filters.planType}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All Plans</option>
              {planTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search" className="filter-label">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="form-input"
              placeholder="Search plans..."
            />
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <Loader />
        ) : plans.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📋</div>
            <h3>No Plans Found</h3>
            <p>Try adjusting your filters to find more plans.</p>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;