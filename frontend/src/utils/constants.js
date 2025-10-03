export const POLICY_STATUS = {
  REQUESTED: 'REQUESTED',
  ACTIVE: 'ACTIVE',
  LAPSED: 'LAPSED',
  CANCELLED: 'CANCELLED',
  MATURED: 'MATURED',
};

export const CLAIM_STATUS = {
  FILED: 'FILED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PAID: 'PAID',
};

export const PLAN_TYPES = [
  'Term Life',
  'Savings',
  'Retirement',
  'Child Education',
];

export const CLAIM_TYPES = [
  'maturity',
  'death',
  'critical_illness',
  'accident',
];

export const PREMIUM_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

export const DOCUMENT_TYPES = [
  { value: 'NIC', label: 'National Identity Card' },
  { value: 'death_certificate', label: 'Death Certificate' },
  { value: 'medical_report', label: 'Medical Report' },
  { value: 'policy_document', label: 'Policy Document' },
  { value: 'other', label: 'Other' },
];