export interface CareerValueProps {
    total_pages: number;
    count: number;
    current: number;
    next: any;
    previous: any;
    page_size: number;
    result: {
        id: number;
        title: string;
        slug: string;
        description: string;
        experience: string;
        designation: string;
        no_of_opening: number;
        category: string;
        location: string;
        job_type: string;
        skills: string;
        salary_range: string;
        deadline: string;
    }[];
}

export interface CareerDetailsData {
    id: number;
    title: string;
    slug: string;
    description: string;
    experience: string;
    designation: string;
    no_of_opening: number;
    category: string;
    location: string;
    job_type: string;
    skills: string;
    salary_range: string;
    deadline: string;
}
