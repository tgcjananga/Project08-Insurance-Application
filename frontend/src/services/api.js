import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Plans API
export const plansAPI = {
  getAll: (params) => api.get('/plans', { params }),
  getById: (id) => api.get(`/plans/${id}`),
  getTypes: () => api.get('/plans/types'),
  create: (planData) => api.post('/plans', planData),
  update: (id, planData) => api.put(`/plans/${id}`, planData),
  delete: (id) => api.delete(`/plans/${id}`),
};

// Policies API
export const policiesAPI = {
  calculatePremium: (data) => api.post('/policies/calculate-premium', data),
  requestPolicy: (policyData) => api.post('/policies', policyData),
  getMyPolicies: (params) => api.get('/policies/my-policies', { params }),
  getById: (id) => api.get(`/policies/${id}`),
  getAll: (params) => api.get('/policies', { params }),
  approve: (id) => api.put(`/policies/${id}/approve`),
  reject: (id) => api.put(`/policies/${id}/reject`),
  updateStatus: (id, status) => api.put(`/policies/${id}/status`, { status }),
};

// Claims API
export const claimsAPI = {
  fileClaim: (formData) => 
    api.post('/claims', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadDocuments: (id, formData) =>
    api.post(`/claims/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyClaims: (params) => api.get('/claims/my-claims', { params }),
  getById: (id) => api.get(`/claims/${id}`),
  getAll: (params) => api.get('/claims', { params }),
  review: (id) => api.put(`/claims/${id}/review`),
  approve: (id, reviewNotes) => api.put(`/claims/${id}/approve`, { reviewNotes }),
  reject: (id, reviewNotes) => api.put(`/claims/${id}/reject`, { reviewNotes }),
  markAsPaid: (id) => api.put(`/claims/${id}/pay`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomerDetails: (id) => api.get(`/admin/customers/${id}`),
  getPolicyStatistics: () => api.get('/admin/statistics/policies'),
  getClaimStatistics: () => api.get('/admin/statistics/claims'),
  getRevenueStatistics: () => api.get('/admin/statistics/revenue'),
};

export default api;