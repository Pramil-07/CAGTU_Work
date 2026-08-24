export interface UserAnalyticsResult {
    user_count: UserCount;
    user_by_gender: UserByGender[];
    deactivated_user_count: number;
    kyc_status: KycStatus;
    age_range: AgeRange;
    roles: Role[];
    groups: Group[];
    most_followed_users: MostFollowedUser[];
}

interface UserCount {
    total_users: number;
    total_profile: number;
    total_kyc_verified: number;
    new_users: number;
    inactive_users: number;
}

interface UserByGender {
    gender?: string;
    count: number;
}

interface KycStatus {
    total: number;
    kyc_accepted: number;
    kyc_rejected: number;
    kyc_pending: number;
}

interface AgeRange {
    age_group_16_to_20: number;
    age_group_21_to_27: number;
    age_group_28_to_35: number;
    age_group_36_to_50: number;
    age_group_above_50: number;
}

interface Role {
    roles__name?: string;
    count: number;
}

interface Group {
    groups__name?: string;
    count: number;
}

interface MostFollowedUser {
    user_id: string;
    user__username: string;
    followers_count: number;
}

export interface EarningsResult {
    currency: string;
    total: number;
}
