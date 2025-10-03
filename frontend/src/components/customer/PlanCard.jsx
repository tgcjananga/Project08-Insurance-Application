import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import './PlanCard.css';

const PlanCard = ({ plan }) => {
  return (
    <div className="plan-card">
      <div className="plan-card-header">
        <h3 className="plan-card-title">{plan.planName}</h3>
        <span className="plan-card-type">{plan.planType}</span>
      </div>

      <div className="plan-card-body">
        <p className="plan-card-description">{plan.description}</p>

        <div className="plan-card-details">
          <div className="plan-detail-item">
            <span className="detail-label">Coverage Range</span>
            <span className="detail-value">
              {formatCurrency(plan.minCoverage)} - {formatCurrency(plan.maxCoverage)}
            </span>
          </div>

          <div className="plan-detail-item">
            <span className="detail-label">Premium Rate</span>
            <span className="detail-value">
              {formatCurrency(plan.monthlyPremiumRate)}/month per 1M
            </span>
          </div>

          <div className="plan-detail-item">
            <span className="detail-label">Age Range</span>
            <span className="detail-value">
              {plan.minAge} - {plan.maxAge} years
            </span>
          </div>

          <div className="plan-detail-item">
            <span className="detail-label">Duration</span>
            <span className="detail-value">{plan.duration} years</span>
          </div>
        </div>
      </div>

      <div className="plan-card-footer">
        <Link 
          to={`/customer/request-policy/${plan.planId}`} 
          className="btn btn-primary btn-block"
        >
          Request Policy
        </Link>
      </div>
    </div>
  );
};

export default PlanCard;