import { createStyles } from "@mantine/core";

export const useEntityServiceProfileStyles = createStyles((theme) => ({
    wrapper: {
        // maxWidth:"345px",
        padding: "24px",
        background:
            theme.colorScheme === "dark"
                ? theme.colors.darkBackground[0]
                : "inherit",
        border:
            theme.colorScheme === "dark"
                ? "none"
                : `1px solid ${theme.colors.gray[4]}`,
        borderRadius: "12px",
    },
    userDetails: {
        display: "flex",
        justifyContent: "space-between",
        ".username": {
            fontSize: "16px",
            fontWeight: 500,
        },
        ".userDetail__name": {
            "&:hover": {
                color: theme.colors.brand[3],
                transition: "0.3s",
            },
            cursor: "pointer",
        },
    },
    budget: {
        display: "flex",
        justifyContent: "space-between",
        borderTop: `1px solid ${theme.colors.gray[2]}`,
        borderBottom: `1px solid ${theme.colors.gray[2]}`,
        ".price-wrapper": {
            display: "flex",
            alignItems: "flex-end",
            flexDirection: "column",
            ".price": {
                fontSize: "20px",
                fontWeight: 500,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.colors.gray[8],
                margin: 0,
                "& span": {
                    marginLeft: 4,
                },
            },
            ".project-type": {
                fontSize: "10px",
                fontWeight: 400,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.colors.gray[8],
                margin: 0,
            },
        },
    },
    buttonArea: {},
    review: {
        display: "flex",
        justifyContent: "space-around",
        borderRadius: 4,
        fontWeight: 400,
        paddingTop: 16,
        fontSize: 12,
        color: theme.colors.gray[9],
        textDecoration: "underline",
        cursor: "pointer",
        "&:hover": {
            color: theme.colors.brand[3],
            transition: "0.3s all ease",
        },
    },
}));
