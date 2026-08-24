import { createStyles } from "@mantine/core";

export const useRedeemCardStyles = createStyles((theme) => ({
    root: {
        width: "100%",
        border:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[8]}`
                : `0.1px solid rgba(0, 0, 0, 0.08)`,
        borderRadius: 4,
        "&:hover": {
            border: `1px solid ${theme.colors[theme.primaryColor][4]}`,
        },
        "& h3": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[2]
                    : theme.colors.homaaleSlate[8],
            fontWeight: 500,
        },
    },
}));
