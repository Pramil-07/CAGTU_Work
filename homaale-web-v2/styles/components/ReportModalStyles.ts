import { createStyles } from "@mantine/core";

export const useReportModalStyles = createStyles((theme) => ({
    wrapper: {
        ".content-wrapper": {
            h4: {
                fontSize: 20,
                marginBottom: 0,
            },
            p: {
                color: theme.colors.homaaleSlate[5],
            },
        },
    },
}));
