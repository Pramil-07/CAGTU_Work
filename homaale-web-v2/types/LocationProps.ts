import type { ReduxStateProps } from "./ReduxStateProps";

export interface LocationProps extends ReduxStateProps {
    status?: string;
    radius?: number;
    data: {
        country?: string;
        city?: string;
        longitude: number | null;
        latitude: number | null;
    };
}
