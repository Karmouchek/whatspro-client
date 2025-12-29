import { formatDistanceToNow, format, differenceInHours } from 'date-fns';

export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return format(new Date(timestamp), 'HH:mm');
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return format(new Date(timestamp), 'dd/MM/yyyy');
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
};

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const getWindowStatus = (expiresAt) => {
  if (!expiresAt) return { active: false, hoursLeft: 0, color: 'red' };
  
  const now = new Date();
  const expires = new Date(expiresAt);
  const hoursLeft = differenceInHours(expires, now);
  
  const active = hoursLeft > 0;
  let color = 'red';
  
  if (hoursLeft > 12) color = 'green';
  else if (hoursLeft > 6) color = 'yellow';
  else if (hoursLeft > 0) color = 'orange';
  
  return {
    active,
    hoursLeft: Math.max(0, hoursLeft),
    color,
  };
};
