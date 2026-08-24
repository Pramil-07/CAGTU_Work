export interface ReferralSchema {
    refer_status: string;
    referred_by: {
        full_name: string;
        profile_image: string;
        username: string;
    };
    referred_to: {
        full_name: string;
        profile_image: string;
        username: string;
    };
    referred_date: Date;
    referred_by_user_reward: string;
    referred_to_user_discount: string;
}
