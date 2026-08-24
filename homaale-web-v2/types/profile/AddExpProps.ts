export interface ExperienceValueProps {
    id: number;
    title: string;
    description: string;
    employment_type: string;
    company_name: string;
    location: string;
    start_date: string;
    end_date: string | null | number | any;
    currently_working: boolean;
}
