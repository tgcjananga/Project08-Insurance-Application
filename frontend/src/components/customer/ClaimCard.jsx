import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import './ClaimCard.css';

const ClaimCard = ({ claim }) => {
  return (
    <div className="claim-card-component">
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
        <div className="claim-info-row">
          <div className="claim-info-item">
            <span className="info-label">Type</span>
            <span className="info-value">
              {claim.claimType.charAt(0).toUpperCase() + 
               claim.claimType.slice(1).replace('_', ' ')}
            </span>
          </div>

          <div className="claim-info-item">
            <span className="info-label">Amount</span>
            <span className="info-value">{formatCurrency(claim.claimAmount)}</span>
          </div>

          <div className="claim-info-item">
            <span className="info-label">Filed</span>
            <span className="info-value">{formatDate(claim.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimCard;