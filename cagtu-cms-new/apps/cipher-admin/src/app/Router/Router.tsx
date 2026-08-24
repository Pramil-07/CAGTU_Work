import * as CipherScreens from '@cagtu-cms/cipher-admin/views';
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
                    <Route path="cms/categories" element={<CipherScreens.Categories />} />
                    <Route path="cms/top-categories" element={<CipherScreens.TopCategories />} />
                    <Route path="cms/recommend" element={<CipherScreens.TaskRecommendList />} />
                    <Route path="cms/top-skills" element={<CipherScreens.TopSkills />} />
                    <Route path="cms/skills" element={<CipherScreens.Skills />} />
                    <Route path="cms/success-stories" element={<CipherScreens.SuccessStoriesList />} />
                    <Route path="cms/trusted-partners" element={<CipherScreens.TrustedPartnersList />} />
                    <Route path="cms/security-question" element={<CipherScreens.SecurityQuestion />} />
                    <Route path="cms/horoscope" element={<CipherScreens.HoroscopeList />} />
                    <Route path="cms/blog" element={<CipherScreens.Bloglist />} />
                    <Route path="cms/blog/:blogID/edit" element={<CipherScreens.CreateBlog />} />
                    <Route path="cms/blog/create" element={<CipherScreens.CreateBlog />} />
                    <Route path="cms/candidates" element={<CipherScreens.Candidates />} />
                    <Route path="cms/career" element={<CipherScreens.CareerList />} />
                    <Route path="cms/career/:careerID/edit" element={<CipherScreens.CreateCareer />} />
                    <Route path="cms/career/create" element={<CipherScreens.CreateCareer />} />
                    <Route path="cms/legal" element={<CipherScreens.LegalList />} />
                    <Route path="cms/legal/:slug" element={<CipherScreens.LegalHistory />} />
                    <Route path="cms/notice" element={<CipherScreens.NoticeList />} />
                    <Route path="cms" element={<CipherScreens.Faq />}>
                        <Route path="faq" element={<CipherScreens.FaqList />} />
                        <Route path="faq/topic" element={<CipherScreens.FaqTopic />} />
                    </Route>
                    <Route path="task/entity-service" element={<CipherScreens.TaskList />} />
                    <Route path="task/entity-service/:taskID/edit" element={<CipherScreens.CreateTask />} />
                    <Route path="task/entity-service/create" element={<CipherScreens.CreateTask />} />
                    <Route path="task/bookings" element={<CipherScreens.Bookings />}>
                        <Route path="pending" element={<CipherScreens.BookingsList status={'pending'} />} />
                        <Route path="approved" element={<CipherScreens.BookingsList status={'approved'} />} />
                        <Route path="rejected" element={<CipherScreens.BookingsList status={'rejected'} />} />
                        <Route path="closed" element={<CipherScreens.BookingsList status={'closed'} />} />
                        <Route path="cancelled" element={<CipherScreens.BookingsList status={'cancelled'} />} />
                    </Route>
                    <Route path="task/orders" element={<CipherScreens.OrdersList />} />
                    <Route path="task/assigned-task" element={<CipherScreens.AssignedTaskList />} />
                    <Route path="services" element={<CipherScreens.ServiceList />} />
                    <Route path="user-roles" element={<CipherScreens.Users />}>
                        <Route path="users" element={<CipherScreens.UserList />} />
                        <Route path="users/kyc" element={<CipherScreens.KYCList />} />
                        <Route path="users/deactivate-history" element={<CipherScreens.DeactivateHistory />} />
                    </Route>
                    <Route path="user-roles" element={<CipherScreens.GroupsAndPermission />}>
                        {/* <Route path="groups/roles" element={<CipherScreens.RoleList />} /> */}
                        <Route path="roles" element={<CipherScreens.GroupList />} />
                    </Route>
                    <Route path="kyc-&-compliance/kyc-documents" element={<CipherScreens.KYCDocuments />} />
                    <Route path="merchant" element={<CipherScreens.Merchant />} />
                    <Route path="shop" element={<CipherScreens.Shop />} />
                    <Route path='product' element={<CipherScreens.Product/>} />
                    <Route path="kyc-&-compliance/kyc-verification" element={<CipherScreens.KYCVerification />} />
                    <Route path="analytics/user" element={<CipherScreens.UserAnalytics />} />
                    <Route path="analytics/entity-service" element={<CipherScreens.EntityServiceAnalytics />} />
                    <Route path="analytics/category" element={<CipherScreens.CategoryAnalytics />} />
                    <Route path="analytics/assigned-task" element={<CipherScreens.AssignedTaskAnalytics />} />
                    <Route path="analytics/booking" element={<CipherScreens.BookingAnalytics />} />
                    <Route path="analytics/offer" element={<CipherScreens.OfferAnalytics />} />
                    <Route path="analytics/payment" element={<CipherScreens.PaymentAnalytics />} />
                    <Route path="analytics/product-analytics" element={<CipherScreens.ProductAnalytics />} />
                    <Route path="analytics/shop-analytics" element={<CipherScreens.ShopAnalytics />} />
                    <Route path="analytics/merchant-analytics" element={<CipherScreens.MerchantAnalytics />} />
                    <Route path="offer/offer-rule" element={<CipherScreens.OfferRule />} />
                    <Route path="offer/service-offer" element={<CipherScreens.ServiceOffer />} />
                    <Route path="offer/redeemption" element={<CipherScreens.OfferRedeem />} />
                    <Route path="rewards/rewards-list" element={<CipherScreens.RewardsList />} />
                    <Route path="rewards/rewards-rule" element={<CipherScreens.RewardsRule />} />
                    <Route path="ratings/rating-list" element={<CipherScreens.RatingList />} />
                    <Route path="rewards/badge" element={<CipherScreens.Badge />} />
                    <Route path="referral/list" element={<CipherScreens.Referral />} />
                    <Route path="payment/transaction-history" element={<CipherScreens.TransactionHistory />} />
                    <Route path="payment/refund-request" element={<CipherScreens.Refund />} />
                    <Route path="payment/approve-request" element={<CipherScreens.Approve />} />

                    <Route path="payment" element={<CipherScreens.Withdraw />}>
                        <Route path="withdraw-request" element={<CipherScreens.WithdrawRequest />} />
                        <Route path="withdraw-request/user-wallets" element={<CipherScreens.UserWallets />} />
                    </Route>
                    <Route path="marketing/advertisement" element={<CipherScreens.Advertisement />} />
                    <Route path="locale/currency" element={<CipherScreens.CurrencyList />} />
                    <Route path="locale/exchange-rate" element={<CipherScreens.ExchangeRateList />} />
                    <Route path="locale/language" element={<CipherScreens.LanguageList />} />
                    <Route path="locale/city" element={<CipherScreens.CityList />} />
                    <Route path="locale/country" element={<CipherScreens.CountryList />} />
                    <Route path="locale" element={<CipherScreens.Bank />}>
                        <Route path="bank" element={<CipherScreens.BankList />} />
                        <Route path="bank/branch" element={<CipherScreens.BranchList />} />
                    </Route>
                    <Route path="email/sender-email" element={<CipherScreens.Email />} />
                    <Route path="email/newsletter" element={<CipherScreens.Newsletter />} />
                    <Route path="email/template" element={<CipherScreens.EmailTemplate />} />
                    <Route path="contact/list" element={<CipherScreens.ContactList />} />
                    <Route path="contact/category" element={<CipherScreens.ContactCategory />} />
                    <Route path="support/ticket-type" element={<CipherScreens.SupportTicketType />} />
                    <Route path="support/ticket" element={<CipherScreens.SupportTicket />} />
                    <Route path="support/reports" element={<CipherScreens.ReportList />} />
                    <Route path="support/merchant-ticket" element={<CipherScreens.MerchantList />} />
                    <Route path="support/shop-ticket" element={<CipherScreens.ShopList />} />
                    {/* <Route path="support/help" element={<CipherScreens.Help />} />
                    <Route path="support/help-topic" element={<CipherScreens.HelpTopic />} /> */}
                    <Route path="feedback/list" element={<CipherScreens.FeedBackList />} />
                    <Route path="feedback/category" element={<CipherScreens.FeedBackCategory />} />
                    <Route path="shop-config/shop" element={<CipherScreens.ShopConfig/>} />
                    <Route path="shop-config/product" element={<CipherScreens.ShopConfig/>} />


                    {/* Not Required for now as it's api has been removed from backend */}
                    {/* <Route path="report" element={<CipherScreens.Report />} /> */}
                </Route>
            </Route>
            <Route path="*" element={<SharedScreens.NoMatch />} />
        </Routes>
    );
};

export default BaseRouter;
