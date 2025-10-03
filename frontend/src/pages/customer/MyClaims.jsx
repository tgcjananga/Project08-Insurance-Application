import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsAPI } from '../../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import './MyClaims.css';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const response = await claimsAPI.getMyClaims(params);
      setClaims(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch claims');
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-claims-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Claims</h1>
            <p className="page-description">
              Track and manage your insurance claims
            </p>
          </div>
          <Link to="/customer/file-claim" className="btn btn-primary">
            + File New Claim
          </Link>
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

        {/* Claims List */}
        {loading ? (
          <Loader />
        ) : claims.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📄</div>
            <h3>No Claims Found</h3>
            <p>You haven't filed any claims yet.</p>
            <Link to="/customer/file-claim" className="btn btn-primary">
              File Your First Claim
            </Link>
          </div>
        ) : (
          <div className="claims-list">
            {claims.map((claim) => (
              <div key={claim._id} className="claim-card">
                <div className="claim-card-header">
                  <div className="claim-header-left">
                    <h3 className="claim-id">{claim.claimId}</h3>
                    <span className="claim-policy-id">Policy: {claim.policyId}</span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(claim.status)}`}>
                    {claim.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="claim-card-body">
                  <div className="claim-info-grid">
                    <div className="claim-info-item">
                      <span className="info-label">Claim Type</span>
                      <span className="info-value claim-type">
                        {claim.claimType.charAt(0).toUpperCase() + 
                         claim.claimType.slice(1).replace('_', ' ')}
                      </span>
                    </div>

                    <div className="claim-info-item">
                      <span className="info-label">Claim Amount</span>
                      <span className="info-value">{formatCurrency(claim.claimAmount)}</span>
                    </div>

                    <div className="claim-info-item">
                      <span className="info-label">Filed Date</span>
                      <span className="info-value">{formatDate(claim.createdAt)}</span>
                    </div>

                    <div className="claim-info-item">
                      <span className="info-label">Documents</span>
                      <span className="info-value">{claim.documents?.length || 0} files</span>
                    </div>
                  </div>

                  <div className="claim-reason">
                    <span className="info-label">Reason:</span>
                    <p className="reason-text">{claim.reason}</p>
                  </div>

                  {claim.reviewNotes && (
                    <div className="claim-review-notes">
                      <span className="info-label">Review Notes:</span>
                      <p className="review-notes-text">{claim.reviewNotes}</p>
                    </div>
                  )}

                  {claim.documents && claim.documents.length > 0 && (
                    <div className="claim-documents">
                      <span className="info-label">Uploaded Documents:</span>
                      <div className="documents-list">
                        {claim.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="document-link"
                          >
                            📄 {doc.type.replace('_', ' ')}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {claim.reviewedAt && (
                  <div className="claim-card-footer">
                    <span className="reviewed-date">
                      Reviewed on {formatDate(claim.reviewedAt)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClaims;