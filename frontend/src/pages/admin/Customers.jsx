import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await adminAPI.getCustomers(params);
      setCustomers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
    setDetailsLoading(true);

    try {
      const response = await adminAPI.getCustomerDetails(customer._id);
      setCustomerDetails(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch customer details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setCustomerDetails(null);
  };

  return (
    <div className="customers-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Customer Management</h1>
            <p className="page-description">
              View and manage customer accounts
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            placeholder="Search by name, email, or NIC..."
          />
        </div>

        {/* Customers Table */}
        {loading ? (
          <Loader />
        ) : customers.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">👥</div>
            <h3>No Customers Found</h3>
            <p>No customers match your search criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>NIC</th>
                  <th>Policies</th>
                  <th>Claims</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div className="customer-name-cell">
                        <span className="name">{customer.fullName}</span>
                      </div>
                    </td>
                    <td className="email-cell">{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td className="nic-cell">{customer.nic}</td>
                    <td>
                      <span className="count-badge">{customer.policyCount || 0}</span>
                    </td>
                    <td>
                      <span className="count-badge">{customer.claimCount || 0}</span>
                    </td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="btn btn-secondary btn-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Customer Details Modal */}
        {showModal && selectedCustomer && (
          <div className="modal-overlay" onClick={closeModal}>
            <div
              className="modal-content modal-large"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Customer Details</h3>
                <button onClick={closeModal} className="modal-close">
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {detailsLoading ? (
                  <Loader />
                ) : customerDetails ? (
                  <div className="customer-details-content">
                    {/* Personal Information */}
                    <div className="details-section">
                      <h4 className="section-subtitle">Personal Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Full Name</span>
                          <span className="info-value">
                            {customerDetails.customer.fullName}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Email</span>
                          <span className="info-value">
                            {customerDetails.customer.email}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Phone</span>
                          <span className="info-value">
                            {customerDetails.customer.phone}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">NIC</span>
                          <span className="info-value">
                            {customerDetails.customer.nic}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Date of Birth</span>
                          <span className="info-value">
                            {formatDate(customerDetails.customer.dateOfBirth)}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Gender</span>
                          <span className="info-value">
                            {customerDetails.customer.gender.charAt(0).toUpperCase() +
                             customerDetails.customer.gender.slice(1)}
                          </span>
                        </div>
                        <div className="info-item info-item-full">
                          <span className="info-label">Address</span>
                          <span className="info-value">
                            {customerDetails.customer.address}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="details-section">
                      <h4 className="section-subtitle">Statistics</h4>
                      <div className="stats-row">
                        <div className="stat-box">
                          <span className="stat-value">
                            {customerDetails.statistics.totalPolicies}
                          </span>
                          <span className="stat-label">Total Policies</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-value">
                            {customerDetails.statistics.activePolicies}
                          </span>
                          <span className="stat-label">Active Policies</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-value">
                            {customerDetails.statistics.totalClaims}
                          </span>
                          <span className="stat-label">Total Claims</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-value">
                            {formatCurrency(customerDetails.statistics.totalCoverage)}
                          </span>
                          <span className="stat-label">Total Coverage</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Policies */}
                    <div className="details-section">
                      <h4 className="section-subtitle">Recent Policies</h4>
                      {customerDetails.policies.length === 0 ? (
                        <p className="empty-message">No policies found</p>
                      ) : (
                        <div className="items-list">
                          {customerDetails.policies.slice(0, 5).map((policy) => (
                            <div key={policy._id} className="list-item">
                              <div className="list-item-info">
                                <span className="list-item-title">
                                  {policy.planName}
                                </span>
                                <span className="list-item-subtitle">
                                  {policy.policyId}
                                </span>
                              </div>
                              <span
                                className={`badge ${
                                  policy.status === 'ACTIVE'
                                    ? 'badge-success'
                                    : 'badge-gray'
                                }`}
                              >
                                {policy.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recent Claims */}
                    <div className="details-section">
                      <h4 className="section-subtitle">Recent Claims</h4>
                      {customerDetails.claims.length === 0 ? (
                        <p className="empty-message">No claims found</p>
                      ) : (
                        <div className="items-list">
                          {customerDetails.claims.slice(0, 5).map((claim) => (
                            <div key={claim._id} className="list-item">
                              <div className="list-item-info">
                                <span className="list-item-title">
                                  {claim.claimId}
                                  </span>
                                <span className="list-item-subtitle">
                                  {formatCurrency(claim.claimAmount)}
                                </span>
                              </div>
                              <span
                                className={`badge ${
                                  claim.status === 'APPROVED' || claim.status === 'PAID'
                                    ? 'badge-success'
                                    : claim.status === 'REJECTED'
                                    ? 'badge-danger'
                                    : 'badge-warning'
                                }`}
                              >
                                {claim.status.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="modal-footer">
                <button onClick={closeModal} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;