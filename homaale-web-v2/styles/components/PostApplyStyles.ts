import { createStyles } from "@mantine/core";

export const usePostApplyStyles = createStyles((theme) => ({
    root: {
        padding: 24,
        border:
            theme.colorScheme === "dark"
                ? "1px solid white"
                : "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        "& h3": {
            fontSize: 24,
            fontWeight: 600,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[2]
                    : theme.colors.gray[9],
            marginTop: 16,
            marginBottom: 30,
        },
        "& p": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[2]
                    : theme.colors.gray[6],
            lineHeight: "27px",
            marginBottom: 30,
            textAlign: "justify",
        },
        ".button_wrapper": {
            fontSize: 15,
            fontWeight: 500,
            "&: hover": {
                color: `${theme.colors[theme.primaryColor][4]}`,
                transition: "0.3s all",
            },
            cursor: "pointer",
            padding: "6px 12px",
            borderRadius: 4,
        },
    },
}));
