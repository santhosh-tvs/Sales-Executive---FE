// Utility functions for Beat Plan

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const dateFormatted = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeFormatted = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${dateFormatted} & ${timeFormatted}`;
};

export const determineStatus = (plan) => {
  if (plan.visited_status === 'visited') return 'Visited';
  if (plan.check_in && !plan.check_out) return 'Check in';
  if (plan.check_in && plan.check_out) return 'Visited';
  return 'New';
};

export const getEndpoint = (filter) => {
  const endpoints = {
    'Visited': '/beat-plan/visited-beat-plan-list',
    'Today': '/beat-plan/plan-visits-list',
    'All': '/beat-plan/new-beat-plan-list',
    'New': '/beat-plan/new-beat-plan-list'
  };
  return endpoints[filter] || endpoints['All'];
};

export const getCurrentDateTime = () => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(`${position.coords.latitude},${position.coords.longitude}`),
      (error) => reject(error)
    );
  });
};

// LocalStorage helpers
export const saveCheckInData = (beatPlanId, data) => {
  const existing = JSON.parse(localStorage.getItem('beatPlanCheckIns') || '{}');
  existing[beatPlanId] = { ...existing[beatPlanId], ...data };
  localStorage.setItem('beatPlanCheckIns', JSON.stringify(existing));
};

export const getCheckInData = (beatPlanId) => {
  const data = JSON.parse(localStorage.getItem('beatPlanCheckIns') || '{}');
  return data[beatPlanId] || null;
};
