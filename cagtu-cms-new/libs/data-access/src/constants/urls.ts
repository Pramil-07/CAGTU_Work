const buzzBrandPath = '/cms/brand';
const buzzProductPath = '/cms/product';
const buzzUserPath = '/staff';
const buzzStockPath = '/stock';
const buzzCategoryPath = '/cms/category';
const buzzServiceCategoryPath = '/cms/service/category';
const buzzAttribute = '/cms/attribute';
const buzzProductAttr = '/cms/product-attribute';
const filestore = '/filestore';
const userPath = '/user';
const userCMSPath = '/user/cms';
const cipherTaskerCMSPath = '/tasker/cms';
const cipherPaymentCMSPath = '/payment/cms';
const cipherRolePath = '/role/cms';
const cipherEntityServicePath = '/task/cms/entity/service';
const cipherEntityPath = '/task/cms/entity';
const cipherTaskPath = '/task';
const cipherCategoryPath = '/task/cms/task-category';
const cipherHoroscopePath = '/astro/cms/horoscope';
const cipherBlogPath = '/blog/cms';
const cipherBlogTagsPath = '/blog';
const cipherCareerPath = '/career/cms';
const cipherTaskService = '/task/cms/service';
const cipherServicePack = '/task/service-package';
const taskerSucessStoryPath = '/tasker/cms/success-story';
const cipherLocalePath = '/locale/cms';
const cipherTopSkillsPath = '/task/cms/top-skills';
const cipherSkillsPath = '/tasker/cms/skill';
const cipherTopCategoriesPath = '/task/top-categories';
const cipherLandingPath = '/landingpage/cms';
const cipherSupportPath = '/support/cms';
const cipherOfferPath = '/offer/cms';
const cipherRewardsPath = '/rewards/cms';
const cipherReferralPath = '/referrals/cms';
const cipherRatingsPath = '/task/cms';
const cipherTransactionPath = '/payment/transaction';
const cipherAnalyticsPath = '/analytics';
const cipherKycDocumentPath = '/task/cms/kyc/document-type';
const cipherPaymentPath = '/payment/cms';
const cipherAdvertisementPath = '/marketing/cms/advertisement';
const cagtuSitePath = '/cagtusite/cms';
const merchant = '/cms-merchant'
const merchantLimit = '/merchant/cms-merchant-limits'

const urls = {
    auth_login: '/user/login',
    auth_refresh: '/user/token/refresh/',
    authPasswordChange: '/user/password-change',
    profileDetail: '/user/profile',
    profileEdit: '/user/profile/edit',
    forgot_password: '/user/forgot-password',
    reset_password: '/user/reset-password',
    blogList: '/blog',
    employeeBlogList: '/blog/my-blog',
    blogPublish: '/blog/create',
    mantainerBlogPublish: '/maintainer/blog/publish',
    blogMultipleDelete: '/blog/multiple-delete',
    blogSoftDelete: '/blog/soft-delete',
    blogUpdate: '/blog/update',
    blogDraft: '/blog-draft/create',
    blogDraftList: '/blog-draft/list',
    blogDraftDetail: '/blog-draft/detail',
    blogDraftUpdate: '/blog-draft/update',
    blogDraftMultipleDelete: '/blog-draft/multiple-delete',
    blogDraftSoftDelete: '/blog-draft/delete',
    blogArchive: '/blog/archive',
    blogMultipleArchive: '/blog/archive/multiple-archive',
    blogArchiveList: '/blog/archive/list',
    blogArchiveDetail: '/blog/archive/detail',
    blogTrashList: '/blog/trash',
    blogTrashHardDelete: '/blog/hard-delete',
    blogTrashMultipleDelete: '/blog/trash/multiple-delete',
    blogSingleRestore: '/blog/restore',
    blogMultipleRestore: '/blog/trash/multiple-restore',
    employeeList: '/employee/list',
    employeeDetail: '/employee/profile',
    employeeRegister: '/employee/registration',
    employeeEdit: '/employee/profile/edit',
    employeeDelete: '/employee/delete',
    employeeMultipleDelete: '/employee/multiple-delete',

    // Career App Urls
    career: {
        auth: {
            login: '/maintainer/login',
            forgotPassword: '/maintainer/forgot-password',
            changePassword: '/maintainer/password-change',
            resetPassword: '/maintainer/reset-password',
        },
        profile: {
            detail: '/maintainer/profile/get',
            update: '/maintainer/profile/update',
        },
        vacancy: {
            list: '/vacancy',
            create: '/vacancy/create',
            singleDelete: '/vacancy/delete',
            multipleDelete: '/vacancy/multiple-delete',
        },
        candidate: {
            list: '/candidate/list',
            detail: '/candidate/detail',
            singleDelete: '/candidate/delete',
            multipleDelete: '/candidate/multiple-delete',
            savedList: '/candidate/saved',
            save: '/candidate/save',
            status: '/candidate/status',
            scheduleInterview: '/candidate/schedule',
        },
        interview: {
            list: '/interviews/list',
            removeInterview: '/candidate/remove/interview',
            multipleRemoveInterview: '/candidate/multiple-remove/interview',
        },
    },

    // Buzz App Urls
    buzz: {
        cms: {
            auth: {
                login: `${buzzUserPath}/login`,
                forgotPassword: `${buzzUserPath}/forgot-password`,
                changePassword: `${buzzUserPath}/password-change`,
                resetPassword: `${buzzUserPath}/reset-password`,
            },
            profile: {
                detail: `${buzzUserPath}/profile`,
            },

            product: {
                path: `${buzzProductPath}`,
                multipleDelete: `${buzzProductPath}/multiple-delete`,
                attribute: `${buzzProductAttr}`,
            },
            stock: {
                path: `${buzzStockPath}`,
                HA: `${buzzStockPath}/HA`,
                cloth: `${buzzProductPath}/cloth`,
                computer: `${buzzProductPath}/computer`,
                mobile: `${buzzProductPath}/mobile`,
                tv: `${buzzProductPath}/tv`,
            },
            brand: {
                path: `${buzzBrandPath}`,
                create: `${buzzBrandPath}/create`,
                multipleDelete: `${buzzBrandPath}/multiple-delete`,
                select: `${buzzBrandPath}/select`,
            },
            category: {
                path: `${buzzCategoryPath}`,
                gParent: `${buzzCategoryPath}/grandparent`,
                parent: `${buzzCategoryPath}/parent`,
                child: `${buzzCategoryPath}/child`,
                childList: `${buzzCategoryPath}/child/list`,
                create: `${buzzCategoryPath}/create`,
                multipleDelete: `${buzzCategoryPath}/multiple-delete`,
            },
            serviceCategory: {
                path: `${buzzServiceCategoryPath}`,
                child: `${buzzServiceCategoryPath}/child`,
                create: `${buzzServiceCategoryPath}/create`,
                multipleDelete: `${buzzServiceCategoryPath}/multiple-delete`,
            },
            attributes: {
                product: {
                    path: `${buzzAttribute}`,
                    multipleDelete: `${buzzAttribute}/multiple-delete`,
                    select: `${buzzAttribute}/select`,
                },
                stock: {
                    path: `${buzzAttribute}/stock`,
                    multipleDelete: `${buzzAttribute}/stock/multiple-delete`,
                    select: `${buzzAttribute}/stock/select`,
                },
                list: {
                    path: `${buzzAttribute}/list`,
                },
            },
        },
    },
    filestore: {
        main: `${filestore}`,
        thumbnail: `${filestore}/thumbnail`,
    },
    cipher: {
        auth: {
            login: `${userPath}/login/`,
            forgotPassword: `${userPath}/forgot-password/`,
            changePassword: `${userPath}/password/change/`,
            tokenRefresh: `${userPath}/token/refresh/`,
        },
        profile: {
            detail: `${userPath}/cms/user-detail/`,
        },
        category: {
            path: `${cipherCategoryPath}/`,
            list: `${cipherCategoryPath}/nested/`,
            selectOptions: `${cipherCategoryPath}/list/`,
            multipleDelete: `${cipherCategoryPath}/multiple-delete/`,
        },
        group: {
            path: `${cipherRolePath}`,
            create: `${cipherRolePath}/create`,
            multipleDelete: `${cipherRolePath}/multiple-delete`,
        },
        resource: {
            path: `${cipherRolePath}`,
        },
        user: {
            path: `${userCMSPath}/user/`,
            multipleVerify: `${userCMSPath}/multiple/verify/`,
            profileVerify: `${userCMSPath}/user/profile/`,
            suspend: `${cipherTaskerCMSPath}/suspend-user/`,
            whitelist: `${cipherTaskerCMSPath}/whitelist-user/`,
            kyc: {
                path: `${cipherTaskerCMSPath}/kyc/`,
                list: `${cipherTaskerCMSPath}/kyc/all/`,
                docVerify: `${cipherTaskerCMSPath}/kyc-document/`,
                companyProfileVerify: `${cipherTaskerCMSPath}/kyc/company/`,
                bankDetailVerify: `${cipherTaskerCMSPath}/bank-detail/verify/`,
            },
            permission: {
                path: `${userPath}/all-permissions/`,
            },
            group: {
                path: `${userPath}/group/`,
                multipleDelete: `${userPath}/multiple-delete/`,
                options: `${userPath}/group/options/`,
            },
            role: {
                path: `${userPath}/role/`,
                multipleDelete: `${userPath}/multiple-delete/`,
                options: `${userPath}/role/options`,
            },
            history: {
                path: '/history/deactivate/history/',
            },
        },
        //api paths for kyc document in general which is different than user kyc
        kyc: {
            path: `${cipherKycDocumentPath}/`,
        },
        task: {
            entityPath: `${cipherEntityServicePath}/`,
            path: `${cipherEntityServicePath}/uuid/`,
            list: `${cipherEntityServicePath}/task/list/`,
            bookings: `${cipherEntityPath}/service-booking/`,
            bookingDetail: `/task/entity/service-booking/`,
            orders: `${cipherEntityPath}/service-booking/`,
            recommend: `${cipherTaskPath}/recommend/`,
            recommendMultipleDelete: `${cipherTaskPath}/recommend/multiple-delete/`,
            multipleDelete: `${cipherEntityServicePath}/multiple-delete/`,
            filestore: `${cipherTaskPath}/filestore/`,
            endorse: `${cipherEntityServicePath}/endorsement/`,
        },
        horoscope: {
            path: `${cipherHoroscopePath}/`,
        },
        blog: {
            path: `${cipherBlogPath}/`,
            list: `${cipherBlogPath}/list/`,
            create: `${cipherBlogPath}/create/`,
            singleDelete: `${cipherBlogPath}/hard-delete`,
            multipleDelete: `${cipherBlogPath}/multiple-delete/`,
            tags: {
                path: `${cipherBlogTagsPath}/tag/`,
            },
        },
        career: {
            path: `${cipherCareerPath}/vacancy/`,
            create: `${cipherCareerPath}/vacancy/create/`,
            singleDelete: `${cipherCareerPath}/vacancy/delete/`,
            multipleDelete: `${cipherCareerPath}/vacancy/multiple-delete/`,
            candidate: {
                list: `${cipherCareerPath}/candidate/list/`,
                detail: `${cipherCareerPath}/candidate/detail/`,
                singleDelete: `${cipherCareerPath}/candidate/delete/`,
                multipleDelete: `${cipherCareerPath}/candidate/multiple-delete/`,
            },
        },
        services: {
            path: `${cipherTaskService}/`,
            image: `${cipherTaskService}-image/`,
            multipleDelete: `${cipherTaskService}/multiple-delete/`,
            myServicesList: 'task/my-services/',
            verify: `${cipherTaskService}/multiple-verify/`,
            package: {
                path: `${cipherServicePack}/`,
                multipleDelete: `${cipherServicePack}/multiple-delete/`,
            },
        },
        merchant: {
            path: `${merchant}`,
            post:'/merchant/',
            bulkPost:'/cms-bulk-upload-merchant/',
            metadata: '/merchant/metadata/'
        },
        bankaccount: {
            path:'/tasker/bank-account',
        },
        shop: {
            path:'/product/shops/all',
            post:'/product/shops/'
        },
        product: {
            path : '/product/',
            search:'/product/search/',
            productsearch:'/product/cms-product-search/',
            put:'/product/',
        },
        productUpload : {
            path:'/cms-bulk-upload-products/',
            get: '/product/cms-download-excel/'
        },
        legal: {
            path: `${cipherLandingPath}/content/`,
            history: `${cipherLandingPath}/content/versions/`,
        },
        notice: {
            path: `${cipherLandingPath}/notice/`,
        },
        email: {
            path: '/support/sender-email/',
            newsletter: {
                path: '/support/newsletter/subscribtions/list/',
            },
            template: {
                path: '/support/email-template/',
            },
            send: {
                path: '/support/send-email/',
            },
        },
        contact: {
            path: '/support/contactus/all/',
            category: {
                path: '/support/contactus/category/',
                otpions: '/support/contactus/category/options/',
            },
        },
        support: {
            ticket: {
                path: `${cipherSupportPath}/support-ticket/`,
                mulipleDelete: `${cipherSupportPath}/support-ticket/multiple-delete/`,
                resolve: `${cipherSupportPath}/support-ticket/resolve/`,
            },
            ticketType: {
                path: `${cipherSupportPath}/support-ticket-type/`,
                mulipleDelete: `${cipherSupportPath}/support-ticket-type/multiple-delete/`,
            },
            merchantTicket:{
                path: `${cipherSupportPath}/support-ticket/`,
                mulipleDelete: `${cipherSupportPath}/support-ticket/multiple-delete/`,
                resolve: `${cipherSupportPath}/support-ticket/resolve/`,
            },
            shopTicket:{
                path: `${cipherSupportPath}/support-ticket/`,
                mulipleDelete: `${cipherSupportPath}/support-ticket/multiple-delete/`,
                resolve: `${cipherSupportPath}/support-ticket/resolve/`,
                reject: `${cipherSupportPath}/close-ticket`,
            },
            feedback: {
                path: `${cipherSupportPath}/feedback/all/`,
                category: {
                    path: `${cipherSupportPath}/feedback/category/`,
                    options: '/support/feedback/category/options/',
                },
            },
            help: {
                path: '/support/help/',
                topic: {
                    path: '/support/help/topic/',
                    multipleDelete: '/support/help/topic/multiple-delete/',
                },
            },
            securityQuestion: {
                path: `${cipherTaskerCMSPath}/security-question/`,
            },
        },
        marketing: {
            successStory: {
                path: `${taskerSucessStoryPath}/`,
                multipleDelete: `${taskerSucessStoryPath}/multiple-delete/`,
            },
            trustedPartners: {
                path: `${cipherLandingPath}/trusted-partner/`,
                multipleDelete: `${cipherLandingPath}/trusted-partner/multiple-delete/`,
            },
            endorsement: {
                path: '/sponsor/cms/endorsement/',
            },
            advertisement: {
                path: `${cipherAdvertisementPath}/`,
            },
        },
        skills: {
            path: `${cipherSkillsPath}/`,
        },
        topSkills: {
            path: `${cipherTopSkillsPath}/`,
            multipleDelete: `${cipherTopSkillsPath}/multiple-delete/`,
        },
        topCategories: {
            path: `${cipherTopCategoriesPath}/`,
            update: `${cipherTopCategoriesPath}/update/`,
            multipleDelete: `${cipherTopCategoriesPath}/multiple-delete/`,
        },
        locale: {
            currency: {
                path: `${cipherLocalePath}/currency/`,
                options: `${cipherLocalePath}/currency/options/`,
                multipleDelete: `${cipherLocalePath}/currency/multiple/delete/`,
            },
            exchangeRate: {
                path: `${cipherLocalePath}/exchangerate/`,
                multipleDelete: `${cipherLocalePath}/exchangerate/multiple-delete/`,
            },
            language: {
                path: `${cipherLocalePath}/language/`,
                options: `${cipherLocalePath}/language/options/`,
                multipleDelete: `${cipherLocalePath}/language/multiple/delete/`,
            },
            city: {
                path: `${cipherLocalePath}/city/`,
                options: `${cipherLocalePath}/city/options/`,
                multipleDelete: `${cipherLocalePath}/city/multipledelete/`,
            },
            country: {
                path: `${cipherLocalePath}/country/`,
                options: `${cipherLocalePath}/country/option/`,
                multipleDelete: `${cipherLocalePath}/country/multiple/delete/`,
            },
            bank: {
                path: `${cipherPaymentCMSPath}/bank-name/`,
                multipleDelete: `${cipherPaymentCMSPath}/bank-name/multiple-delete/`,
                options: `${cipherPaymentCMSPath}/bank-name/options/`,
            },
            bankBranch: {
                path: `${cipherPaymentCMSPath}/bank-branch/`,
                multipleDelete: `${cipherPaymentCMSPath}/bank-branch/multiple-delete/`,
            },
        },
        offer: {
            rule: {
                path: `${cipherOfferPath}/offer-rule/`,
                options: `offer/offer-rule/`,
                multipleDelete: `${cipherOfferPath}/offer-rule/multiple-delete/`,
            },
            service: {
                path: `${cipherOfferPath}/serviceoffer/`,
                multipleDelete: `${cipherOfferPath}/serviceoffer/multiple-delete/`,
            },
            scope: {
                path: `${cipherOfferPath}/offerscope/`,
            },
            redeem: {
                path: `${cipherOfferPath}/offerredeem/list/`,
            },
        },
        rewards: {
            path: `${cipherRewardsPath}/reward-point/`,
            list: `${cipherRewardsPath}/reward/`,
            rule: {
                path: `${cipherRewardsPath}/rewardrule/`,
            },
            badge: {
                path: `${cipherRewardsPath}/badge/`,
            },
        },
        referral: {
            path: `${cipherReferralPath}/`,
            list: `${cipherReferralPath}/referrals/`,
        },
        ratings: {
            path: `${cipherRatingsPath}/`,
            list: `${cipherRatingsPath}/rating/`,
        },
        transaction: {
            path: `${cipherTransactionPath}/`,
        },
        faq: {
            path: '/support/faq/',
            multipleDelete: '/support/faq/multiple-delete/',
            topic: {
                path: '/support/faq-topic/',
                multipleDelete: '/support/faq-topic/multiple-delete/',
            },
        },
        report: {
            path: `${cipherTaskerCMSPath}/report/`,
        },
        avatar: {
            path: '/task/cms/avatar/',
        },


        analytics: {
            user: `${cipherAnalyticsPath}/user/`,
            entityService: `${cipherAnalyticsPath}/entity-service/`,
            category: `${cipherAnalyticsPath}/category/`,
            assignedTask: `${cipherAnalyticsPath}/assigned-task/`,
            booking: `${cipherAnalyticsPath}/booking/`,
            offer: `${cipherAnalyticsPath}/offer/`,
            tasker: `${cipherAnalyticsPath}/tasker/`,
            payment: `${cipherAnalyticsPath}/payment/`,
            product: `${cipherAnalyticsPath}/product/`,
            shop: `${cipherAnalyticsPath}/shop/`,
            merchant: `${cipherAnalyticsPath}/merchant/`,
        },

        payment: {
            path: `${cipherPaymentPath}/`,
            order: `${cipherPaymentPath}/order/`,
            refund: `${cipherPaymentPath}/refund/`,
            withdrawRequest: `${cipherPaymentPath}/withdraw-request/`,
            withdraw: `${cipherPaymentPath}/withdraw/`,
            paymentMethods: `/payment/payment-method/options/`,
            userWallet: '/wallet/cms/',
            userWalletWithdraw: `${cipherPaymentPath}/auto-withdraw/`,
            transactionHistoryExport: `${cipherPaymentPath}/transaction-export/`,
            userWalletExport: `/wallet/cms/export-wallet/`,
            userWalletImport: `/wallet/cms/import-wallet/`,
        },
        shopLimit :{
            path:`${merchantLimit}`,
            create:`${merchantLimit}/create/`,

        }
    },
    //Cagtu site urls
    cagtuSite: {
        path: `${cagtuSitePath}/`,
        newsletter: {
            path: `${cagtuSitePath}/sitenewsletter/`,
            list: `${cagtuSitePath}/sitenewsletter/list/all/`,
            send: `${cagtuSitePath}/sitenewsletter/send-email/all/`,
        },
        contact: {
            path: `${cagtuSitePath}/sitecontactus/`,
            list: `${cagtuSitePath}/sitecontactus/all/`,
        },
        vacancy: {
            path: `${cagtuSitePath}/sitevacancy/`,
        },
        career: {
            path: `${cagtuSitePath}/sitecareer/`,
            list: `${cagtuSitePath}/sitecareer/list/`,
        },
    },
};

export default urls;
