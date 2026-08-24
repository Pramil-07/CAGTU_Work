import { createStyles } from "@mantine/core";
export const useCareerFormStyles = createStyles((theme) => ({
    root: {
        boxSizing: "border-box",
        justifyContent: "center",
        marginTop: 30,
        padding: 48,
        width: 818,
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 4,
        ".formBtn": {
            background: theme.colors.gray[9],
            padding: "8px 16px",
            width: 183,
        },
    },
}));
