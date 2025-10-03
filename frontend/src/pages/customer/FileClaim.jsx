import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { policiesAPI, claimsAPI } from '../../services/api';
import { CLAIM_TYPES, DOCUMENT_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import './FileClaim.css';

const FileClaim = () => {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    policyId: '',
    claimType: '',
    claimAmount: '',
    reason: '',
  });

  const [files, setFiles] = useState({
    NIC: null,
    death_certificate: null,
    medical_report: null,
    policy_document: null,
    other: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchActivePolicies();
  }, []);

  const fetchActivePolicies = async () => {
    try {
      setLoading(true);
      const response = await policiesAPI.getMyPolicies({ status: 'ACTIVE' });
      setPolicies(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e, fieldName) => {
    const selectedFiles = e.target.files;
    
    if (fieldName === 'other') {
      setFiles({
        ...files,
        other: Array.from(selectedFiles),
      });
    } else {
      setFiles({
        ...files,
        [fieldName]: selectedFiles[0],
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.policyId) {
      newErrors.policyId = 'Please select a policy';
    }
    if (!formData.claimType) {
      newErrors.claimType = 'Please select claim type';
    }
    if (!formData.claimAmount || formData.claimAmount <= 0) {
      newErrors.claimAmount = 'Please enter valid claim amount';
    }
    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = 'Please provide a detailed reason (minimum 10 characters)';
    }
    if (!files.NIC) {
      newErrors.NIC = 'NIC document is required';
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

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('policyId', formData.policyId);
      formDataToSend.append('claimType', formData.claimType);
      formDataToSend.append('claimAmount', formData.claimAmount);
      formDataToSend.append('reason', formData.reason);

      // Append files
      if (files.NIC) formDataToSend.append('NIC', files.NIC);
      if (files.death_certificate) formDataToSend.append('death_certificate', files.death_certificate);
      if (files.medical_report) formDataToSend.append('medical_report', files.medical_report);
      if (files.policy_document) formDataToSend.append('policy_document', files.policy_document);
      
      files.other.forEach((file) => {
        formDataToSend.append('other', file);
      });

      await claimsAPI.fileClaim(formDataToSend);
      toast.success('Claim filed successfully!');
      navigate('/customer/claims');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to file claim');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPolicy = policies.find(p => p.policyId === formData.policyId);

  if (loading) {
    return <Loader />;
  }

  if (policies.length === 0) {
    return (
      <div className="file-claim-page">
        <div className="container">
          <div className="no-policies-message">
            <div className="no-policies-icon">📋</div>
            <h2>No Active Policies</h2>
            <p>You need an active policy to file a claim.</p>
            <button onClick={() => navigate('/plans')} className="btn btn-primary">
              Browse Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="file-claim-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">File a Claim</h1>
          <p className="page-description">
            Submit your claim request with supporting documents
          </p>
        </div>

        <form onSubmit={handleSubmit} className="claim-form">
          <div className="claim-form-sections">
            {/* Claim Details Section */}
            <div className="form-section">
              <h3 className="form-section-title">Claim Details</h3>

              <div className="form-group">
                <label htmlFor="policyId" className="form-label">
                  Select Policy *
                </label>
                <select
                  id="policyId"
                  name="policyId"
                  value={formData.policyId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Select Policy --</option>
                  {policies.map((policy) => (
                    <option key={policy._id} value={policy.policyId}>
                      {policy.policyId} - {policy.planName} ({formatCurrency(policy.coverageAmount)})
                    </option>
                  ))}
                </select>
                {errors.policyId && (
                  <span className="form-error">{errors.policyId}</span>
                )}
              </div>

              {selectedPolicy && (
                <div className="selected-policy-info">
                  <h4>Policy Information</h4>
                  <div className="policy-info-grid">
                    <div>
                      <span className="info-label">Plan Name:</span>
                      <span className="info-value">{selectedPolicy.planName}</span>
                    </div>
                    <div>
                      <span className="info-label">Coverage:</span>
                      <span className="info-value">{formatCurrency(selectedPolicy.coverageAmount)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="claimType" className="form-label">
                  Claim Type *
                </label>
                <select
                  id="claimType"
                  name="claimType"
                  value={formData.claimType}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Select Type --</option>
                  {CLAIM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {errors.claimType && (
                  <span className="form-error">{errors.claimType}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="claimAmount" className="form-label">
                  Claim Amount (LKR) *
                </label>
                <input
                  type="number"
                  id="claimAmount"
                  name="claimAmount"
                  value={formData.claimAmount}
                  onChange={handleChange}
                  className="form-input"
                  min="1"
                  max={selectedPolicy?.coverageAmount || ''}
                  required
                />
                {selectedPolicy && (
                  <div className="input-hint">
                    Maximum: {formatCurrency(selectedPolicy.coverageAmount)}
                  </div>
                )}
                {errors.claimAmount && (
                  <span className="form-error">{errors.claimAmount}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reason" className="form-label">
                  Reason for Claim *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="4"
                  placeholder="Please provide detailed information about your claim..."
                  required
                />
                {errors.reason && (
                  <span className="form-error">{errors.reason}</span>
                )}
              </div>
            </div>

            {/* Documents Section */}
            <div className="form-section">
              <h3 className="form-section-title">Supporting Documents</h3>
              <p className="section-description">
                Upload required documents to support your claim
              </p>

              <div className="file-upload-grid">
                <div className="file-upload-group">
                  <label className="file-upload-label">
                    National Identity Card (NIC) *
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'NIC')}
                    className="file-input"
                    required
                  />
                  {files.NIC && (
                    <div className="file-preview">✓ {files.NIC.name}</div>
                  )}
                  {errors.NIC && (
                    <span className="form-error">{errors.NIC}</span>
                  )}
                </div>

                <div className="file-upload-group">
                  <label className="file-upload-label">
                    Death Certificate (if applicable)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'death_certificate')}
                    className="file-input"
                  />
                  {files.death_certificate && (
                    <div className="file-preview">✓ {files.death_certificate.name}</div>
                  )}
                </div>

                <div className="file-upload-group">
                  <label className="file-upload-label">
                    Medical Report (if applicable)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'medical_report')}
                    className="file-input"
                  />
                  {files.medical_report && (
                    <div className="file-preview">✓ {files.medical_report.name}</div>
                  )}
                </div>

                <div className="file-upload-group">
                  <label className="file-upload-label">
                    Policy Document (if applicable)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'policy_document')}
                    className="file-input"
                  />
                  {files.policy_document && (
                    <div className="file-preview">✓ {files.policy_document.name}</div>
                  )}
                </div>

                <div className="file-upload-group file-upload-full">
                  <label className="file-upload-label">
                    Other Documents (Optional - Multiple files allowed)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'other')}
                    className="file-input"
                    multiple
                  />
                  {files.other.length > 0 && (
                    <div className="file-preview">
                      ✓ {files.other.length} file(s) selected
                    </div>
                  )}
                </div>
              </div>

              <div className="file-info-box">
                <strong>Note:</strong> Accepted file formats: JPG, PNG, PDF. Maximum file size: 5MB per file.
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/customer/claims')}
              className="btn btn-secondary"
              >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting Claim...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileClaim;