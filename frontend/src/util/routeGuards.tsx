import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom';
import { PageLoader } from '../components/common';
import { useAuth } from '../context/AuthContext';

interface RedirectState {
  from?: Location;
}

export const ProtectedRoute = () => {
  const { state: authState } = useAuth();
  const location = useLocation();

  if (authState.status === 'loading') return <PageLoader label="Checking your session" />;
  if (authState.status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location } satisfies RedirectState} />;
  }
  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { state: authState } = useAuth();
  const location = useLocation();

  if (authState.status === 'loading') return <PageLoader label="Checking your session" />;
  if (authState.status === 'authenticated') {
    const from = (location.state as RedirectState | null)?.from;
    return <Navigate to={from ? `${from.pathname}${from.search}${from.hash}` : '/'} replace />;
  }
  return <Outlet />;
};
