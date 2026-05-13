import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { getCurrentUser } from '../lib/storage';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
