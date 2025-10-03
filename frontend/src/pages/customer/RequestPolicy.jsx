import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { plansAPI, policiesAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { PREMIUM_FREQUENCIES } from '../../utils/constants';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import PremiumCalculator from '../../components/customer/PremiumCalculator';
import './RequestPolicy.css';

const RequestPolicy = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    coverageAmount: '',
    premiumFrequency: 'monthly',
    beneficiaries: [
      { name: '', relationship: '', nic: '', percentage: 100 },
    ],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      // Find plan by planId (not _id)
      const response = await plansAPI.getAll({ planType: '' });
      const foundPlan = response.data.data.find(p => p.planId === planId);
      
      if (foundPlan) {
        setPlan(foundPlan);
        setFormData(prev => ({
          ...prev,
          coverageAmount: foundPlan.minCoverage,
        }));
      } else {
        toast.error('Plan not found');
        navigate('/plans');
      }
    } catch (error) {
      toast.error('Failed to fetch plan details');
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleBeneficiaryChange = (index, field, value) => {
    const newBeneficiaries = [...formData.beneficiaries];
    newBeneficiaries[index][field] = value;
    setFormData({ ...formData, beneficiaries: newBeneficiaries });
  };

  const addBeneficiary = () => {
    setFormData({
      ...formData,
      beneficiaries: [
        ...formData.beneficiaries,
        { name: '', relationship: '', nic: '', percentage: 0 },
      ],
    });
  };

  const removeBeneficiary = (index) => {
    if (formData.beneficiaries.length > 1) {
      const newBeneficiaries = formData.beneficiaries.filter((_, i) => i !== index);
      setFormData({ ...formData, beneficiaries: newBeneficiaries });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate coverage amount
    if (!formData.coverageAmount) {
      newErrors.coverageAmount = 'Coverage amount is required';
    } else if (
      formData.coverageAmount < plan.minCoverage ||
      formData.coverageAmount > plan.maxCoverage
    ) {
      newErrors.coverageAmount = `Coverage must be between ${formatCurrency(
        plan.minCoverage
      )} and ${formatCurrency(plan.maxCoverage)}`;
    }

    // Validate beneficiaries
    formData.beneficiaries.forEach((beneficiary, index) => {
      if (!beneficiary.name) {
        newErrors[`beneficiary_${index}_name`] = 'Name is required';
      }
      if (!beneficiary.relationship) {
        newErrors[`beneficiary_${index}_relationship`] = 'Relationship is required';
      }
      if (!beneficiary.nic) {
        newErrors[`beneficiary_${index}_nic`] = 'NIC is required';
      }
      if (!beneficiary.percentage || beneficiary.percentage <= 0) {
        newErrors[`beneficiary_${index}_percentage`] = 'Valid percentage required';
      }
    });

    // Validate total percentage
    const totalPercentage = formData.beneficiaries.reduce(
      (sum, b) => sum + Number(b.percentage),
      0
    );
    if (totalPercentage !== 100) {
      newErrors.totalPercentage = `Total percentage must be 100% (currently ${totalPercentage}%)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);

      const requestData = {
        planId: plan.planId,
        coverageAmount: Number(formData.coverageAmount),
        premiumFrequency: formData.premiumFrequency,
        beneficiaries: formData.beneficiaries.map(b => ({
          ...b,
          percentage: Number(b.percentage),
        })),
      };

      await policiesAPI.requestPolicy(requestData);
      toast.success('Policy request submitted successfully!');
      navigate('/customer/policies');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit policy request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="request-policy-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Request Policy</h1>
          <p className="page-description">
            Fill in the details to request your insurance policy
          </p>
        </div>

        <div className="request-policy-grid">
          {/* Left Side - Form */}
          <div className="policy-form-section">
            <div className="plan-info-card">
              <h2 className="plan-info-title">{plan.planName}</h2>
              <span className="plan-info-type">{plan.planType}</span>
              <p className="plan-info-description">{plan.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="policy-request-form">
              {/* Coverage Amount */}
              <div className="form-group">
                <label htmlFor="coverageAmount" className="form-label">
                  Coverage Amount *
                </label>
                <input
                  type="number"
                  id="coverageAmount"
                  name="coverageAmount"
                  value={formData.coverageAmount}
                  onChange={handleChange}
                  className="form-input"
                  min={plan.minCoverage}
                  max={plan.maxCoverage}
                  step="100000"
                  required
                />
                <div className="input-hint">
                  Range: {formatCurrency(plan.minCoverage)} -{' '}
                  {formatCurrency(plan.maxCoverage)}
                </div>
                {errors.coverageAmount && (
                  <span className="form-error">{errors.coverageAmount}</span>
                )}
              </div>

              {/* Premium Frequency */}
              <div className="form-group">
                <label htmlFor="premiumFrequency" className="form-label">
                  Payment Frequency *
                </label>
                <select
                  id="premiumFrequency"
                  name="premiumFrequency"
                  value={formData.premiumFrequency}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {PREMIUM_FREQUENCIES.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Beneficiaries Section */}
              <div className="beneficiaries-form-section">
                <div className="section-header-with-button">
                  <h3 className="form-section-title">Beneficiaries</h3>
                  <button
                    type="button"
                    onClick={addBeneficiary}
                    className="btn btn-secondary btn-sm"
                  >
                    + Add Beneficiary
                  </button>
                </div>

                {errors.totalPercentage && (
                  <div className="alert alert-error">{errors.totalPercentage}</div>
                )}

                {formData.beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="beneficiary-form-card">
                    <div className="beneficiary-form-header">
                      <h4>Beneficiary {index + 1}</h4>
                      {formData.beneficiaries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBeneficiary(index)}
                          className="btn-remove"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="beneficiary-form-grid">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          value={beneficiary.name}
                          onChange={(e) =>
                            handleBeneficiaryChange(index, 'name', e.target.value)
                          }
                          className="form-input"
                          required
                        />
                        {errors[`beneficiary_${index}_name`] && (
                          <span className="form-error">
                            {errors[`beneficiary_${index}_name`]}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Relationship *</label>
                        <input
                          type="text"
                          value={beneficiary.relationship}
                          onChange={(e) =>
                            handleBeneficiaryChange(index, 'relationship', e.target.value)
                          }
                          className="form-input"
                          placeholder="e.g., Spouse, Son, Daughter"
                          required
                        />
                        {errors[`beneficiary_${index}_relationship`] && (
                          <span className="form-error">
                            {errors[`beneficiary_${index}_relationship`]}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">NIC Number *</label>
                        <input
                          type="text"
                          value={beneficiary.nic}
                          onChange={(e) =>
                            handleBeneficiaryChange(index, 'nic', e.target.value)
                          }
                          className="form-input"
                          required
                        />
                        {errors[`beneficiary_${index}_nic`] && (
                          <span className="form-error">
                            {errors[`beneficiary_${index}_nic`]}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Percentage (%) *</label>
                        <input
                          type="number"
                          value={beneficiary.percentage}
                          onChange={(e) =>
                            handleBeneficiaryChange(
                              index,
                              'percentage',
                              e.target.value
                            )
                          }
                          className="form-input"
                          min="1"
                          max="100"
                          required
                        />
                        {errors[`beneficiary_${index}_percentage`] && (
                          <span className="form-error">
                            {errors[`beneficiary_${index}_percentage`]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/plans')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - Calculator */}
          <div className="calculator-section">
            <PremiumCalculator plan={plan} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPolicy;