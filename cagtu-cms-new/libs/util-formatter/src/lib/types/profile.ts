export interface ProfileFormValueProps extends CareerProfileFormValueProps {
    employeeType: string;
}
export interface CareerProfileFormValueProps {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    address: string;
    contact_number: string;
    dob: string;
    facebook_URL: string;
    linkedin_URL: string;
    twitter_URL: string;
    profile_image: any[];
    profilePreviewUrl?: any[];
}
