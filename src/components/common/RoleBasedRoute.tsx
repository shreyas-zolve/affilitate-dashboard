import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleBasedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, this will be handled by ProtectedRoute
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user's role is included in the allowed roles
  if (!allowedRoles.includes(user.role)) {
    // Redirect to leads page if role is not allowed
    return <Navigate to="/leads" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;