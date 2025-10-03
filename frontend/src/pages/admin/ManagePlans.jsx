import { useState, useEffect } from 'react';
import { plansAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { PLAN_TYPES } from '../../utils/constants';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import './ManagePlans.css';

const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    planId: '',
    planName: '',
    planType: '',
    description: '',
    minCoverage: '',
    maxCoverage: '',
    monthlyPremiumRate: '',
    minAge: '',
    maxAge: '',
    duration: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await plansAPI.getAll();
      setPlans(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      planId: '',
      planName: '',
      planType: '',
      description: '',
      minCoverage: '',
      maxCoverage: '',
      monthlyPremiumRate: '',
      minAge: '',
      maxAge: '',
      duration: '',
    });
    setErrors({});
    setEditingPlan(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planId: plan.planId,
      planName: plan.planName,
      planType: plan.planType,
      description: plan.description,
      minCoverage: plan.minCoverage,
      maxCoverage: plan.maxCoverage,
      monthlyPremiumRate: plan.monthlyPremiumRate,
      minAge: plan.minAge,
      maxAge: plan.maxAge,
      duration: plan.duration,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.planId) newErrors.planId = 'Plan ID is required';
    if (!formData.planName) newErrors.planName = 'Plan name is required';
    if (!formData.planType) newErrors.planType = 'Plan type is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.minCoverage || formData.minCoverage <= 0)
      newErrors.minCoverage = 'Valid minimum coverage is required';
    if (!formData.maxCoverage || formData.maxCoverage <= 0)
      newErrors.maxCoverage = 'Valid maximum coverage is required';
    if (Number(formData.minCoverage) >= Number(formData.maxCoverage))
      newErrors.maxCoverage = 'Maximum coverage must be greater than minimum';
    if (!formData.monthlyPremiumRate || formData.monthlyPremiumRate <= 0)
      newErrors.monthlyPremiumRate = 'Valid premium rate is required';
    if (!formData.minAge || formData.minAge < 18)
      newErrors.minAge = 'Minimum age must be at least 18';
    if (!formData.maxAge || formData.maxAge > 100)
      newErrors.maxAge = 'Maximum age must be 100 or less';
    if (Number(formData.minAge) >= Number(formData.maxAge))
      newErrors.maxAge = 'Maximum age must be greater than minimum';
    if (!formData.duration || formData.duration <= 0)
      newErrors.duration = 'Valid duration is required';

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

      const planData = {
        ...formData,
        minCoverage: Number(formData.minCoverage),
        maxCoverage: Number(formData.maxCoverage),
        monthlyPremiumRate: Number(formData.monthlyPremiumRate),
        minAge: Number(formData.minAge),
        maxAge: Number(formData.maxAge),
        duration: Number(formData.duration),
      };

      if (editingPlan) {
        await plansAPI.update(editingPlan._id, planData);
        toast.success('Plan updated successfully');
      } else {
        await plansAPI.create(planData);
        toast.success('Plan created successfully');
      }

      closeModal();
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      await plansAPI.delete(planId);
      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete plan');
    }
  };

  return (
    <div className="manage-plans-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Insurance Plans</h1>
            <p className="page-description">
              Create, edit, and manage insurance plan offerings
            </p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary">
            + Create New Plan
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : plans.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📋</div>
            <h3>No Plans Found</h3>
            <p>Create your first insurance plan to get started.</p>
            <button onClick={openCreateModal} className="btn btn-primary">
              Create Plan
            </button>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan._id} className="plan-card-admin">
                <div className="plan-card-header">
                  <div>
                    <h3 className="plan-name">{plan.planName}</h3>
                    <span className="plan-id">ID: {plan.planId}</span>
                  </div>
                  <span className={`badge ${plan.isActive ? 'badge-success' : 'badge-gray'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="plan-card-body">
                  <div className="plan-type-badge">{plan.planType}</div>
                  <p className="plan-description">{plan.description}</p>

                  <div className="plan-details">
                    <div className="detail-row">
                      <span className="detail-label">Coverage Range</span>
                      <span className="detail-value">
                        {formatCurrency(plan.minCoverage)} - {formatCurrency(plan.maxCoverage)}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Premium Rate</span>
                      <span className="detail-value">
                        {formatCurrency(plan.monthlyPremiumRate)}/month per 1M
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Age Range</span>
                      <span className="detail-value">
                        {plan.minAge} - {plan.maxAge} years
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{plan.duration} years</span>
                    </div>
                  </div>
                </div>

                <div className="plan-card-footer">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                <button onClick={closeModal} className="modal-close">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Plan ID *</label>
                      <input
                        type="text"
                        name="planId"
                        value={formData.planId}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g., PLAN-006"
                        disabled={!!editingPlan}
                        required
                      />
                      {errors.planId && (
                        <span className="form-error">{errors.planId}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Plan Type *</label>
                      <select
                        name="planType"
                        value={formData.planType}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value="">Select Type</option>
                        {PLAN_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.planType && (
                        <span className="form-error">{errors.planType}</span>
                      )}
                    </div>

                    <div className="form-group form-group-full">
                      <label className="form-label">Plan Name *</label>
                      <input
                        type="text"
                        name="planName"
                        value={formData.planName}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g., Premium Life Protection"
                        required
                      />
                      {errors.planName && (
                        <span className="form-error">{errors.planName}</span>
                      )}
                    </div>

                    <div className="form-group form-group-full">
                      <label className="form-label">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-textarea"
                        rows="3"
                        placeholder="Describe the plan benefits and features..."
                        required
                      />
                      {errors.description && (
                        <span className="form-error">{errors.description}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Minimum Coverage (LKR) *</label>
                      <input
                        type="number"
                        name="minCoverage"
                        value={formData.minCoverage}
                        onChange={handleChange}
                        className="form-input"
                        min="0"
                        step="100000"
                        required
                      />
                      {errors.minCoverage && (
                        <span className="form-error">{errors.minCoverage}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Maximum Coverage (LKR) *</label>
                      <input
                        type="number"
                        name="maxCoverage"
                        value={formData.maxCoverage}
                        onChange={handleChange}
                        className="form-input"
                        min="0"
                        step="100000"
                        required
                      />
                      {errors.maxCoverage && (
                        <span className="form-error">{errors.maxCoverage}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Monthly Premium Rate *</label>
                      <input
                        type="number"
                        name="monthlyPremiumRate"
                        value={formData.monthlyPremiumRate}
                        onChange={handleChange}
                        className="form-input"
                        min="0"
                        step="100"
                        placeholder="Per 1M coverage"
                        required
                      />
                      {errors.monthlyPremiumRate && (
                        <span className="form-error">{errors.monthlyPremiumRate}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Duration (Years) *</label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="form-input"
                        min="1"
                        max="50"
                        required
                      />
                      {errors.duration && (
                        <span className="form-error">{errors.duration}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Minimum Age *</label>
                      <input
                        type="number"
                        name="minAge"
                        value={formData.minAge}
                        onChange={handleChange}
                        className="form-input"
                        min="18"
                        max="100"
                        required
                      />
                      {errors.minAge && (
                        <span className="form-error">{errors.minAge}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Maximum Age *</label>
                      <input
                        type="number"
                        name="maxAge"
                        value={formData.maxAge}
                        onChange={handleChange}
                        className="form-input"
                        min="18"
                        max="100"
                        required
                      />
                      {errors.maxAge && (
                        <span className="form-error">{errors.maxAge}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting
                      ? 'Saving...'
                      : editingPlan
                      ? 'Update Plan'
                      : 'Create Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePlans;