export interface FileStoreUploadPayload {
    files: File | File[] | string;
    media_type?: "image" | "video" | "pdf";
    url?: string;
    placeholder?: string;
}
