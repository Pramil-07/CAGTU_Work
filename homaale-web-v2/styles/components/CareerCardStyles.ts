import { createStyles } from "@mantine/core";
export const useCareerCardStyles = createStyles((theme) => ({
    root: {
        padding: 24,
        boxShadow: "0px 4px 14px rgba(33, 29, 79, 0.1)",
        borderRadius: 4,
        background:
            theme.colorScheme === "dark"
                ? theme.colors.gray[8]
                : theme.colors.white[0],
        cursor: "pointer",
        "& h4": {
            fontSize: 18,
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.gray[8],
        },
        "& p": {
            fontSize: 12,
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.gray[8],
        },
        ".apply_section": {
            padding: 10,
            width: 124,
            ":hover": {
                background: theme.colors.gray[4],
                borderRadius: 4,
            },
        },
        ".right_pointed_arrow": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.gray[8],
        },
    },
}));
