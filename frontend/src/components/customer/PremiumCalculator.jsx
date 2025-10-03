import { useState } from 'react';
import { policiesAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { PREMIUM_FREQUENCIES } from '../../utils/constants';
import { toast } from 'react-toastify';
import './PremiumCalculator.css';

const PremiumCalculator = ({ plan }) => {
  const [formData, setFormData] = useState({
    coverageAmount: plan.minCoverage,
    premiumFrequency: 'monthly',
  });
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setResult(null); // Clear previous result
  };

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      const response = await policiesAPI.calculatePremium({
        planId: plan.planId,
        coverageAmount: Number(formData.coverageAmount),
        premiumFrequency: formData.premiumFrequency,
      });
      setResult(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to calculate premium');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="premium-calculator">
      <h3 className="calculator-title">Calculate Your Premium</h3>

      <div className="calculator-form">
        <div className="form-group">
          <label htmlFor="coverageAmount" className="form-label">
            Coverage Amount
          </label>
          <input
            type="number"
            id="coverageAmount"
            name="coverageAmount"
            value={formData.coverageAmount}
            onChange={handleChange}
            min={plan.minCoverage}
            max={plan.maxCoverage}
            step="100000"
            className="form-input"
          />
          <div className="input-hint">
            Range: {formatCurrency(plan.minCoverage)} - {formatCurrency(plan.maxCoverage)}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="premiumFrequency" className="form-label">
            Payment Frequency
          </label>
          <select
            id="premiumFrequency"
            name="premiumFrequency"
            value={formData.premiumFrequency}
            onChange={handleChange}
            className="form-select"
          >
            {PREMIUM_FREQUENCIES.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCalculate}
          className="btn btn-primary btn-block"
          disabled={calculating}
        >
          {calculating ? 'Calculating...' : 'Calculate Premium'}
        </button>
      </div>

      {result && (
        <div className="calculator-result">
          <div className="result-header">
            <h4>Premium Calculation Result</h4>
          </div>
          <div className="result-details">
            <div className="result-item">
              <span className="result-label">Coverage Amount</span>
              <span className="result-value">
                {formatCurrency(result.coverageAmount)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">Payment Frequency</span>
              <span className="result-value">
                {result.premiumFrequency.charAt(0).toUpperCase() + 
                 result.premiumFrequency.slice(1)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">Discount</span>
              <span className="result-value result-discount">{result.discount}</span>
            </div>
            <div className="result-item result-total">
              <span className="result-label">Your Premium</span>
              <span className="result-value result-amount">
                {formatCurrency(result.premiumAmount)}/{result.premiumFrequency}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">Policy Duration</span>
              <span className="result-value">{result.duration}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumCalculator;