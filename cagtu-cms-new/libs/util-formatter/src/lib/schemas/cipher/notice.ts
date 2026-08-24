export interface NoticeResult {
    id: number;
    name: string;
    message: string;
    is_active: boolean;
    created_date: Date;
}

export interface NoticeFormValuesProps extends Pick<NoticeResult, 'name' | 'message' | 'is_active'> {
    id: number | null;
}
