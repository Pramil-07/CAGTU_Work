export interface VacancySchema {
    id: number;
    title: string;
    designation: string;
    description: string;
    no_of_opening: number;
    category: string;
    location: string;
    country: string;
    job_type: string;
    skills: string;
    salary_range: string;
    deadline: string;
    status: boolean;
    candidates: number;
    is_active: boolean;
    experience: string;
}
