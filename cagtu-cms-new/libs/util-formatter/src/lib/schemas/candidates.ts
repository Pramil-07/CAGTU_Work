export interface CandidatesSchema {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    experience: string;
    cover_letter: string;
    candidate_status: string;
    cv: string;
    resume: string;
    location: string;
    notice_period: string;
    current_salary: string;
    expected_salary: string;
    interview_date: boolean;
    interview_time: number;
    saved: boolean;
    vacancy: VacancyType;
}

export interface CagtuSiteCandidatesSchema {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    experience: string;
    cover_letter: string;
    cv: string;
    resume: string;
    expected_salary: string;
    department: string;
    interested_position: string;
    created_at: Date;
    updated_at: Date;
}
export interface VacancyType {
    title: string;
    designation: string;
}
