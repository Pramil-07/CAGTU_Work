export interface CreateVacancyFormValueProps {
    id?: string;
    title: string;
    designation: string;
    description: string;
    category: string;
    no_of_opening: string;
    experience: string;
    skills: string[];
    deadline: string;
    location: string;
    country: string;
    job_type: string;
    salary_range?: string;
    salary_range_first?: string;
    salary_range_second?: string;
    status: boolean;
}
export interface CreateVacancyCagtuSiteFormValueProps {
    id?: string;
    title: string;
    designation: string;
    description: string;
    category: string;
    no_of_opening: string;
    experience: string;
    skills: string[];
    deadline: string;
    location: string;
    country: string;
    job_type: string;
    salary_range?: string;
    salary_range_first?: string;
    salary_range_second?: string;
    is_active: boolean;
}
