import { UserContext } from '@cagtu-cms/util-formatter';
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const { isAdmin } = useContext(UserContext);

    if (!isAdmin) {
        return <Navigate to="/pagenotfound" replace />;
    }
    return <Outlet />;
};

export default AdminRoute;
