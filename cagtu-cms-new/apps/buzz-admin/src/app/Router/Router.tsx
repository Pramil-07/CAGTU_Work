import * as BuzzScreens from '@cagtu-cms/buzz-admin/views';
import * as SharedScreens from '@cagtu-cms/ui-shared/views';
import { Route, Routes } from 'react-router-dom';

const BaseRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<BuzzScreens.Login />} />
            <Route path="forgot-password" element={<BuzzScreens.ForgotPassword />} />
            <Route path="reset-password" element={<BuzzScreens.ResetPassword />} />
            <Route element={<SharedScreens.ProtectedRoute />}>
                <Route path="/" element={<BuzzScreens.Admin />}>
                    <Route path="dashboard" element={<BuzzScreens.Dashboard />} />
                    <Route path="products" element={<BuzzScreens.ProductList />} />
                    <Route path="products/:productID/edit" element={<BuzzScreens.CreateProduct />} />
                    <Route path="products/create" element={<BuzzScreens.CreateProduct />} />
                    <Route path="products/:productID/stocks" element={<BuzzScreens.StockList />} />
                    <Route path="brands" element={<BuzzScreens.BrandList />} />
                    <Route path="categories" element={<BuzzScreens.CategoriesList />} />
                    <Route path="categories/:categoryId" element={<BuzzScreens.SubCategoriesList />} />
                    <Route path="categories/:categoryId/:subCategoryId" element={<BuzzScreens.ChildSubCategoriesList />} />
                    <Route path="service-categories" element={<BuzzScreens.ServiceCategoriesList />} />
                    <Route path="product-attributes" element={<BuzzScreens.ProductAttributesList />} />
                    <Route path="stock-attributes" element={<BuzzScreens.StockAttributesList />} />
                </Route>
            </Route>
            <Route path="*" element={<SharedScreens.NoMatch />} />
        </Routes>
    );
};

export default BaseRouter;
