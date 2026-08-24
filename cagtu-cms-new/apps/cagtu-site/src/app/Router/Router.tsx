import * as CipherScreens from '@cagtu-cms/cagtu-site/views';
import * as SharedScreens from '@cagtu-cms/ui-shared/views';
import { Route, Routes } from 'react-router-dom';

const BaseRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<CipherScreens.Login />} />
            <Route path="forgot-password" element={<CipherScreens.ForgotPassword />} />
            <Route path="reset-password" element={<CipherScreens.ResetPassword />} />
            <Route element={<SharedScreens.ProtectedRoute />}>
                <Route path="/" element={<CipherScreens.Admin />}>
                    <Route path="dashboard" element={<CipherScreens.Dashboard />} />
                    <Route path="careers" element={<CipherScreens.CareerList />} />
                    <Route path="careers/create" element={<CipherScreens.CareerCreate />} />
                    <Route path="careers/:careerID/edit" element={<CipherScreens.CareerCreate />} />
                    <Route path="candidates" element={<CipherScreens.Candidates />} />
                    <Route path="newsletter" element={<CipherScreens.Newsletter />} />
                    <Route path="contacts" element={<CipherScreens.Contacts />} />
                </Route>
            </Route>
            <Route path="*" element={<SharedScreens.NoMatch />} />
        </Routes>
    );
};

export default BaseRouter;
