// Format currency (LKR)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format datetime
export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate age from date of birth
export const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  const statusMap = {
    REQUESTED: 'badge-warning',
    ACTIVE: 'badge-success',
    LAPSED: 'badge-danger',
    CANCELLED: 'badge-gray',
    MATURED: 'badge-primary',
    FILED: 'badge-warning',
    UNDER_REVIEW: 'badge-primary',
    APPROVED: 'badge-success',
    REJECTED: 'badge-danger',
    PAID: 'badge-success',
  };
  
  return statusMap[status] || 'badge-gray';
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};