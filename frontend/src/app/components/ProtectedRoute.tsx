import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { getCurrentUser } from '../lib/storage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
