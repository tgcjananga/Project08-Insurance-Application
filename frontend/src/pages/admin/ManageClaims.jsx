import { useState, useEffect } from 'react';
import { claimsAPI } from '../../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import './ManageClaims.css';

const ManageClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const response = await claimsAPI.getAll(params);
      setClaims(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch claims');
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (claimId) => {
    try {
      setActionLoading({ ...actionLoading, [claimId]: true });
      await claimsAPI.review(claimId);
      toast.success('Claim moved to review');
      fetchClaims();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to move claim to review');
    } finally {
      setActionLoading({ ...actionLoading, [claimId]: false });
    }
  };

  const openApproveModal = (claim) => {
    setSelectedClaim(claim);
    setReviewNotes('');
    setShowModal(true);
  };

  const openRejectModal = (claim) => {
    setSelectedClaim(claim);
    setReviewNotes('');
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedClaim) return;

    try {
      setActionLoading({ ...actionLoading, [selectedClaim._id]: true });
      await claimsAPI.approve(selectedClaim._id, reviewNotes);
      toast.success('Claim approved successfully');
      setShowModal(false);
      setSelectedClaim(null);
      fetchClaims();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve claim');
    } finally {
      setActionLoading({ ...actionLoading, [selectedClaim._id]: false });
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;

    if (!reviewNotes.trim()) {
      toast.error('Review notes are required for rejection');
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [selectedClaim._id]: true });
      await claimsAPI.reject(selectedClaim._id, reviewNotes);
      toast.success('Claim rejected');
      setShowModal(false);
      setSelectedClaim(null);
      fetchClaims();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject claim');
    } finally {
      setActionLoading({ ...actionLoading, [selectedClaim._id]: false });
    }
  };

  const handleMarkAsPaid = async (claimId) => {
    if (!window.confirm('Mark this claim as paid?')) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [claimId]: true });
      await claimsAPI.markAsPaid(claimId);
      toast.success('Claim marked as paid');
      fetchClaims();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark claim as paid');
    } finally {
      setActionLoading({ ...actionLoading, [claimId]: false });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClaim(null);
    setReviewNotes('');
  };

  return (
    <div className="manage-claims-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Claims</h1>
            <p className="page-description">
              Review and process insurance claim requests
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="claims-filter">
          <label htmlFor="statusFilter" className="filter-label">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Claims</option>
            <option value="FILED">Filed</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {/* Claims Table */}
        {loading ? (
          <Loader />
        ) : claims.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📄</div>
            <h3>No Claims Found</h3>
            <p>No claims match your filter criteria.</p>
          </div>
        ) : (
          <div className="claims-list">
            {claims.map((claim) => (
              <div key={claim._id} className="claim-card-admin">
                <div className="claim-card-header">
                  <div className="claim-header-info">
                    <h3 className="claim-id">{claim.claimId}</h3>
                    <span className="claim-policy-id">Policy: {claim.policyId}</span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(claim.status)}`}>
                    {claim.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="claim-card-body">
                  <div className="claim-info-section">
                    <h4 className="section-subtitle">Customer Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Name</span>
                        <span className="info-value">
                          {claim.userId?.fullName || 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">
                          {claim.userId?.email || 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Phone</span>
                        <span className="info-value">
                          {claim.userId?.phone || 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">NIC</span>
                        <span className="info-value">
                          {claim.userId?.nic || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="claim-info-section">
                    <h4 className="section-subtitle">Claim Details</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Type</span>
                        <span className="info-value claim-type">
                          {claim.claimType.charAt(0).toUpperCase() + 
                           claim.claimType.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Amount</span>
                        <span className="info-value">
                          {formatCurrency(claim.claimAmount)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Filed Date</span>
                        <span className="info-value">
                          {formatDate(claim.createdAt)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Documents</span>
                        <span className="info-value">
                          {claim.documents?.length || 0} files
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="claim-reason-section">
                    <h4 className="section-subtitle">Reason for Claim</h4>
                    <p className="reason-text">{claim.reason}</p>
                  </div>

                  {claim.documents && claim.documents.length > 0 && (
                    <div className="claim-documents-section">
                      <h4 className="section-subtitle">Uploaded Documents</h4>
                      <div className="documents-grid">
                        {claim.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="document-link"
                          >
                            <span className="doc-icon">📄</span>
                            <span className="doc-name">
                              {doc.type.replace('_', ' ')}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {claim.reviewNotes && (
                    <div className="review-notes-section">
                      <h4 className="section-subtitle">Review Notes</h4>
                      <p className="review-notes-text">{claim.reviewNotes}</p>
                    </div>
                  )}
                </div>

                <div className="claim-card-footer">
                  <div className="action-buttons">
                    {claim.status === 'FILED' && (
                      <button
                        onClick={() => handleReview(claim._id)}
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading[claim._id]}
                      >
                        {actionLoading[claim._id] ? 'Processing...' : 'Move to Review'}
                      </button>
                    )}

                    {claim.status === 'UNDER_REVIEW' && (
                      <>
                        <button
                          onClick={() => openApproveModal(claim)}
                          className="btn btn-success btn-sm"
                          disabled={actionLoading[claim._id]}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(claim)}
                          className="btn btn-danger btn-sm"
                          disabled={actionLoading[claim._id]}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {claim.status === 'APPROVED' && (
                      <button
                        onClick={() => handleMarkAsPaid(claim._id)}
                        className="btn btn-success btn-sm"
                        disabled={actionLoading[claim._id]}
                      >
                        {actionLoading[claim._id] ? 'Processing...' : 'Mark as Paid'}
                      </button>
                    )}

                    {claim.status === 'PAID' && (
                      <span className="status-message">
                        ✓ Claim has been paid
                      </span>
                    )}

                    {claim.status === 'REJECTED' && (
                      <span className="status-message error">
                        ✗ Claim was rejected
                      </span>
                    )}
                  </div>

                  {claim.reviewedAt && (
                    <span className="reviewed-info">
                      Reviewed on {formatDate(claim.reviewedAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Approve/Reject */}
        {showModal && selectedClaim && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Review Claim: {selectedClaim.claimId}</h3>
                <button onClick={closeModal} className="modal-close">
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Review Notes</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="form-textarea"
                    rows="4"
                    placeholder="Enter your review notes..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="btn btn-danger"
                  disabled={actionLoading[selectedClaim._id]}
                >
                  {actionLoading[selectedClaim._id] ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={handleApprove}
                  className="btn btn-success"
                  disabled={actionLoading[selectedClaim._id]}
                >
                  {actionLoading[selectedClaim._id] ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageClaims;