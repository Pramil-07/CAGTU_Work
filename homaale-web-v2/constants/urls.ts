const entityPath = "/task/entity/service/";
const blogPath = "/blog/";
const taskerPath = "/tasker/";
const merchantList = "/merchants"
const careerPath = "/career/vacancy/";
const localePath = "/locale/client/";
const bookings = "/task/entity/service-booking/";
const support = "/support/";
const payment = "/payment/";
const offer = "/offer/";
const event = "/event/";
const rating = "/task/rating/";
const taskCategory = "/task/task-category/";
const wallet = "/wallet/";
// f4d32232-7043-4bbe-9d9a-db5339f4d021
const urls = {
    auth: {
        login: "/user/login/",
        signup: "/user/signup/",
        refresh: "/user/token/refresh/",
        changePassword: "/user/password/change/",
        google: "/user/register/social/google-oauth2/",
        facebook: "/user/register/social/facebook/",
        activity: "/history/my-activities/",
        securityQuestion: "/tasker/cms/security-question/",
        securityAnswer: "/tasker/security-answer/",
        forgotPassword: "/user/reset/",
        resetPassword: "/user/reset/email/verify/",
        verifyOtp: "/user/reset/otp/verify/",
    },
    entity: {
        list: entityPath,
        booking: bookings,
        service: `${entityPath}?is_requested=false`,
        service_per_user: `${entityPath}?is_requested=false&user=`,
        myService:`${entityPath}?is_requested=false&created_by=`,
        task: `${entityPath}?is_requested=true`,
        my_task: `${entityPath}?is_requested=true&created_by=`,
        my_applicants: `${bookings}`,
        taskApplicantsNumber: `${entityPath}tasker-count`,
        approvedTaskList: `${entityPath}task/list/`,
        application: "/task/application",
        assigneeDetail: "task/asignee-task-detail/",
        assignerDetail: "task/assigner-task-detail/",
        assignerApplication: "task",
        heroCategory: "task/hero-category",
        status: `${entityPath}task/status/`,
        service_options: `/task/service/list/options/`,
        recommended_similar: `${entityPath}recommend-similar/`,
    },
    myList: {
        activeServices: `${entityPath}?is_requested=false&status=true`, // Active services
        inactiveServices: `${entityPath}?is_requested=false&is_active=false`, // Inactive services
        activeTasks: `${entityPath}?is_requested=true&is_active=true`, // Active tasks
        inactiveTasks: `${entityPath}?is_requested=true&status=false`, // Inactive tasks
    },
    explore: {
        services: "/task/explore/page/?is_requested=false",
        tasks: "/task/explore/page/?is_requested=true",
        taskers: "/tasker/explore-tasker",
    },
    profile: {
        portfolio: `${taskerPath}portfolio/`,
        education: `${taskerPath}education/`,
        experience: `${taskerPath}experience/`,
        certifications: `${taskerPath}certification/`,
        bank_account: `${taskerPath}bank-account/`,
        rating: `/task/rating`,
    },
    booking: {
        initial: `${bookings}`,
        requested_task: `${bookings}?is_requested=true`,
        applicants: `${entityPath}applicants/`,
        accept: `${bookings}accept/`,
        negotiate: `${bookings}negotiate/`,
        approval: `${bookings}approval/`,
        decline: `${bookings}reject/`,
        cancel: `${bookings}cancel/`,
        new_task: `${entityPath}task/list/`,
        new_task_detail: `${entityPath}task/`,
        my_booking: `/task/entity/service-mybooking/`,
    },
    contactus: `/support/contactus/`,
    feedbackcategory: `/support/feedback/category/options/`,
    feedback: `/support/feedback/`,
    taxCalculator: `/support/tax-calculator/`,
    report: {
        issue_type: "/support/support-ticket-type/options/",
        support_ticket: "/support/support-ticket/",
    },

    tasker: {
        list: taskerPath,
        profile: `${taskerPath}profile/`,
        create_profile: `${taskerPath}my-profile/`,
        top_tasker: `${taskerPath}top-tasker/`,
        success_story: `${taskerPath}success-story/`,
        changephone: `${taskerPath}change-phone/`,
        changeEmail: `${taskerPath}change-email/`,
        securityAnswer: `${taskerPath}security-answer/`,
        documents: `${taskerPath}kyc-document/`,
        services: `/task/entity/service?is_requested=false`,
        tasks: `/task/entity/service?is_requested=true`,
        referral_code: "/referrals/user/code",
    },
    kyc: {
        postKyc: "/tasker/kyc/",
        patchKyc: "/tasker/my-kyc/",
        myKyc: "/tasker/my-kyc/",
        kycDocument: "/tasker/kyc-document/",
        getDocumentType: "/task/kyc/document-type/",
    },
    wallet: {
        mywallet: `${wallet}mywallet/`,
        withdraw: `${wallet}withdraw-request/`,
        history: `${wallet}wallethistory/`,
    },

    followers: {
        list: `${taskerPath}my-followers/`,
    },
    followings: {
        list: `${taskerPath}my-following/`,
    },
    follow: `${taskerPath}follow/`,

    category: {
        dropdown: taskCategory,
        top: "/task/top-categories/",
        nested: `${taskCategory}nested/`,
    },

    carrer: { list: `${careerPath}list/`, detail: `${careerPath}detail/` },
    blog: { list: blogPath, detail: `${blogPath}detail/` },
    wishlist: {
        list: "task/wishlist/",
    },
    bookmark: "/task/bookmark/",
    locale: {
        localePath,
        city: `${localePath}city/options/`,
        currency: `/locale/cms/currency/options/?ordering=name`,
    },
    trusted_partners: "/landingpage/trusted-partner/",
    advertisement: "/marketing/advertisement/",
    hero_category: "/task/hero-category/",
    privacyPolicy: "/landingpage/content/privacy-policy/",
    termsandconditions: "/landingpage/content/terms-conditions/",
    dataDeletion: "/landingpage/content/data-deletion/",
    horoscope: "/astro/horoscope/",
    support: {
        help: `${support}help/`,
        helpTopics: `${support}help/topic/`,
        faq: `${support}faq/`,
        faqTopic: `${support}faq-topic/`,
    },
    payment: {
        method: `${payment}cms/payment-method/?page=-1`,
        option: `${payment}payment-method/options/`,
        intent: `${payment}intent/`,
        order: `${payment}order/`,
        bank_options: `${payment}bank-name/options/`,
        bank_branch_options: `${payment}bank-branch/`,
        claim: `${payment}payment/claim/`,
    },
    offer: {
        initial: offer,
        offerCode: `${offer}applyoffercode/`,
        reedem: `${offer}redeem/`,
        list: `${offer}offerredeem/list/`,
        all: `${offer}cms/serviceoffer`,
        rewardlisting: `${offer}my-rewards/`,
    },
    redeem: {
        statement: `${taskerPath}redeem-statement/`,
        redeempoints: `${offer}redeem-points/`,
        rewardpoints: `/rewards/reward-points`,
    },
    cart: {
        list: `/task/pay/task-list/`,
        add: `/task/add/cart/`,
    },
    filestore: `/task/filestore/`,
    otp: {
        verify: `/user/reset/otp/verify/`,
        resend: `/user/resend/otp/activation/`,
    },
    event: {
        initial: event,
        schedule: `${event}schedule/`,
    },
    notification: "/notification/read/",
    user: { chat: "/user/chat/" },
    connectedAccounts: "/user/linked-accounts/list/",
    unlinkAccount: "/user/unlink/social/",
    deactivate: "/user/deactivate/",
    rating: {
        initial: rating,
        service: `${rating}service/`,
        tasker: `${rating}list/`,
    },
    location: "/locale/iplocation/",
    search: `/search/dashboard/`,
    entityServiceArchive: "/task/entity/service-archive/",


    merchantSlots:{
        slots:"/availableSlot/",
        staff:"/merchant/staff/list/",
        entityService: "/task/entity/my-entity-services/",
    },


    merchantRating:{
        reviewList: "/task/rating/merchant/",
        createReview: "/task/merchant/rating/create/",
        actionReview: "/task/rating/"
    },

    package:{
        packages:"/packages/",
        updatePackage:"/packages/update/",
        package_service:"/task/entity/my-entity-services/",
    },
    members:{
        loggedUserID:"/merchant/",
        getStaff:"/merchant/staff/assign/",
        staffOptions:"/merchant/staff/options/",
        getStaffList:"/merchant/staff/list/",
        postStaff:"/merchant/staff/",
    },
    addStaff:{
        postStaff:"/merchant/create-staff/",
        putStaff:"/merchant/staff/",
    },
    staffList:{
        deleteStaff:"/merchant/staff/",
        getStaffList:"/merchant/staff/list/",
    },
};
export default urls;
