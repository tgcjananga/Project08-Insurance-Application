import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import './PolicyCard.css';

const PolicyCard = ({ policy }) => {
  return (
    <div className="policy-card">
      <div className="policy-card-header">
        <div className="policy-header-left">
          <h3 className="policy-card-title">{policy.planName}</h3>
          <span className="policy-id">Policy ID: {policy.policyId}</span>
        </div>
        <span className={`badge ${getStatusBadgeClass(policy.status)}`}>
          {policy.status}
        </span>
      </div>

      <div className="policy-card-body">
        <div className="policy-info-grid">
          <div className="policy-info-item">
            <span className="info-label">Plan Type</span>
            <span className="info-value">{policy.planType}</span>
          </div>

          <div className="policy-info-item">
            <span className="info-label">Coverage Amount</span>
            <span className="info-value">{formatCurrency(policy.coverageAmount)}</span>
          </div>

          <div className="policy-info-item">
            <span className="info-label">Premium Amount</span>
            <span className="info-value">
              {formatCurrency(policy.premiumAmount)}/{policy.premiumFrequency}
            </span>
          </div>

          <div className="policy-info-item">
            <span className="info-label">Start Date</span>
            <span className="info-value">{formatDate(policy.startDate)}</span>
          </div>

          <div className="policy-info-item">
            <span className="info-label">End Date</span>
            <span className="info-value">{formatDate(policy.endDate)}</span>
          </div>

          <div className="policy-info-item">
            <span className="info-label">Beneficiaries</span>
            <span className="info-value">{policy.beneficiaries?.length || 0}</span>
          </div>
        </div>

        {policy.beneficiaries && policy.beneficiaries.length > 0 && (
          <div className="beneficiaries-section">
            <h4 className="beneficiaries-title">Beneficiaries</h4>
            <div className="beneficiaries-list">
              {policy.beneficiaries.map((beneficiary, index) => (
                <div key={index} className="beneficiary-item">
                  <div className="beneficiary-info">
                    <span className="beneficiary-name">{beneficiary.name}</span>
                    <span className="beneficiary-relation">({beneficiary.relationship})</span>
                  </div>
                  <span className="beneficiary-percentage">{beneficiary.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {policy.policyDocumentURL && (
        <div className="policy-card-footer">
          <a 
            href={policy.policyDocumentURL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            📄 View Policy Document
          </a>
        </div>
      )}
    </div>
  );
};

export default PolicyCard;