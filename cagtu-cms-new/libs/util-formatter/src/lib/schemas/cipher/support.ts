import { AssignedTaskFilterFormValuesProps } from './task';

// Support Tciket Type List Result
export interface SupportTicketTypeResult {
    id: number;
    used_by: number;
    target: '';
    notify_to: NotifyTo[];
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
    name: string;
}

// Notify user detail
export interface NotifyTo {
    id: number;
    name: string;
}

// Support Ticket Type Form Detail
export interface SupportTicketTypeFormValuesProps {
    id: number | null;
    name: string;
    target: '';
    notify_to: string[];
    is_active: boolean;
}

// Support Tikcet List Result
export interface SupportTicketResult {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    reason: string;
    type: {
        id: number;
        name: string;
        slug: string;
    };
    created_by: UserProfile;
    user: UserProfile;
    assigned_to: UserProfile;
    priority: {
        value: number;
        label: string;
    };
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
    status: string;
    is_resolved: boolean;
    attachment: Attachment[];
    description: string;
    object_type: string;
    object_id: string;
    object: string;
    action: string;
    action_performed_by: UserProfile;
}

// Attachment Detail
export interface Attachment {
    id: number;
    media: string;
    media_type: string;
    name: string;
    size: string;
}

// User Profile Detail
export interface UserProfile {
    id: string;
    username: string;
    email: string;
    phone: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    profile_image: string;
}

// Support Ticket Resolve Types
export interface SupportTicketResolveProps {
    action: string;
    is_resolved: boolean;
}

// Support Ticket Form Detail
export interface SupportTicketFormValuesProps {
    id: number | null;
    priority: string;
    reason: string;
    type: string;
    assigned_to?: string;
    user: string;
    is_active: boolean;
    is_resolved: boolean;
    description: string;
    object_id: string;
    model: string;
}

// Support list flter form detail
export interface SupportFilterFormValuesProps extends Pick<AssignedTaskFilterFormValuesProps, 'status' | 'assigned_to' | 'ordering'> {
    type: string;
    start_date: string;
    end_date: string;
    is_active: string;
    priority: string;
    created_range: string;
    is_resolved: string;
}

// Feebback list result
export interface FeedbackResult {
    id: number;
    feedback_category: {
        id: number;
        name: string;
    };
    created_at: Date;
    updated_at: Date;
    status: string;
    subject: string;
    description: string;
    attachment: string;
    user: UserProfile;
}

// Feedback category list result
export interface FeedbackCategoryResult {
    id: number;
    name: string;
    used_by: string;
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
}

// Feedback form deail
export interface FeedbackFormValuesProps {
    id: number | null;
    name: string;
    is_active: boolean;
}

//Feedback list filter form detail
export interface FeedbackFilterFormValuesProps {
    feedback_category_id: string;
    ordering: string;
    start_date: string;
    end_date: string;
    created_range: string;
}

// Contact list result
export interface ContactResult {
    id: number;
    contact_us_category: {
        id: number;
        name: string;
    };
    created_at: Date;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    message: string;
}

// Contact category list result
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContactCategoryResult extends FeedbackCategoryResult {}

// Contact catgeory form detail
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContactFormValuesProps extends FeedbackFormValuesProps {}

// Contact list filter form detail
export interface ContactFilterFormValuesProps extends Omit<FeedbackFilterFormValuesProps, 'feedback_category_id'> {
    contact_us_category_id: string;
}

// Faq topic list result
export interface FaqTopicResult {
    id: number;
    faq_count: string;
    created_at: Date;
    updated_at: Date;
    status: string;
    topic: string;
}

// Faq topic form detail
export interface FaqTopicFormValuesProps {
    id: number | null;
    topic: string;
}

// Faq list result
export interface FaqResult {
    id: number;
    topic: {
        id: number;
        topic: string;
    };
    created_at: Date;
    updated_at: Date;
    status: string;
    title: string;
    content: string;
}

// Faq form detail
export interface FaqFormValuesProps extends Pick<FaqResult, 'title' | 'content'> {
    id: number | null;
    topic: string;
}

// Report list result
export interface ReportResult {
    id: number;
    model: string;
    object: EntityService; // Check data types for entity service, user, mercant
    reported_by: UserProfile;
    action_performed_by: UserProfile;
    reason: string;
    description: string;
    reported_date: Date;
    action_performed_date: Date;
    action: string;
    is_active: boolean;
    attachment: Attachment[];
}

// Report result of entity service
export interface EntityService extends UserProfile {
    id: string;
    title: string;
    is_requested: boolean;
    slug: string;
}
// Report list filter form detail
export interface ReportFilterFormValuesProps {
    model: string;
    ordering: string;
    reported_by: string;
}

// Help Topic Result
export interface HelpTopicResult {
    id: number | null;
    topic: string;
    is_active?: boolean;
}

// Help Result
export interface HelpResult {
    id: number;
    user: UserProfile;
    topic: {
        id: number;
        topic: string;
    };
    reason: string;
    details: string;
    created_at: Date;
}

// Help filter form detail
export interface HelpFilterFormValueProps extends Omit<FeedbackFilterFormValuesProps, 'start_date' | 'end_date' | 'feedback_category_id'> {
    date_range_before: string;
    date_range_after: string;
    topic: string;
    user: string;
}

export interface SecurityQuestionResult {
    id: number | null;
    question: string;
}
