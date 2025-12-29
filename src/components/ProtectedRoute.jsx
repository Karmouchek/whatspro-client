import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const agent = JSON.parse(localStorage.getItem('agent') || '{}');
  
  // If super admin is required, check role
  if (requireSuperAdmin && agent.role !== 'super_admin') {
    // Redirect to inbox (clients default page)
    return <Navigate to="/inbox" replace />;
  }
  
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireSuperAdmin: PropTypes.bool
};
