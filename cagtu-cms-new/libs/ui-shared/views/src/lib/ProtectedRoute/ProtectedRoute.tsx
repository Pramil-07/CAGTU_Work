import { auth } from '@cagtu-cms/data-access';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
    const location = useLocation();

    if (!auth.getJwt()) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    return <Outlet />;
};

export default ProtectedRoute;
