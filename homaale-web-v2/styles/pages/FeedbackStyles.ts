import { createStyles } from "@mantine/core";

export const useFeedbackStyles = createStyles((theme) => ({
    form: {
        padding: "24px",
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: "8px",
        "& h4": {
            marginBottom: "24px",
        },
        "& h5": {
            lineHeight: "22px",
            fontWeight: 500,
            marginBottom: "6px",
        },
    },
    address: {
        display: "flex",
        flexDirection: "column",
        gap: 18,
        "& h5": {
            fontWeight: 400,
            lineHeight: "18px",
        },
    },
    formbutton: {
        marginTop: "40px",
    },
}));
