import { createStyles } from "@mantine/core";

export const useCareerStyles = createStyles((theme) => ({
    jobopeningwrapper: {
        "& h4": {
            fontSize: 12,
            margin: 0,
            whiteSpace: "nowrap",
        },
        width: 94,
        cursor: "pointer",
        marginTop: 32,
    },
    openingdesc: {
        "& h4": {
            fontSize: 18,
            margin: 0,
        },
        padding: 24,
        boxShadow: "0px 4px 14px rgba(33, 29, 79, 0.1)",
        borderRadius: 4,
    },
    tab: {
        gap: 80,
        "& h5": {
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.gray[8],
        },
    },
    firstboxwrapper: {
        ".career_first_image": {
            [theme.fn.smallerThan("md")]: {
                display: "none",
            },
        },
        "& p": {
            fontWeight: 400,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[2]
                    : theme.colors.gray[8],
            marginTop: 12,
            marginBottom: 48,
        },
        "& h3": {
            fontSize: 16,
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.brand[3],
        },
        "& h4": {
            margin: 0,
            fontSize: 48,
            fontWeight: 700,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[4]
                    : theme.colors.gray[8],

            [theme.fn.smallerThan("xs")]: {
                fontSize: 30,
                fontWeight: 400,
            },
        },
        ".job_wrapper": {
            cursor: "pointer",
            background: "#1E293B",
            padding: "12px 25px 12px 30px",
            borderRadius: 6,
            width: 253,
            [theme.fn.smallerThan("xs")]: {
                width: 220,
            },
            "& h4": {
                fontSize: 15,
                fontWeight: 500,
                color: theme.colors.white[0],
            },
        },
    },
    secondaryheader1: {
        fontSize: 48,
        fontWeight: 700,
        color: theme.colors.gray[8],
    },
    firstheaderwrapper: {
        cursor: "pointer",
        background: theme.colors.socialicons[9],
        width: 260,
        padding: "12px 25px 12px 30px",
        gap: 15,
        borderRadius: 6,
        color: theme.colors.brand[0],
        "& h4": {
            color: theme.colors.white[0],
            margin: 0,
        },
    },
    expert_section: {
        display: "flex",
        gap: 30,
        alignItems: "center",
        "& h1": {
            fontSize: 48,
            fontWeight: 600,
            width: 302,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.gray[8],
        },
        ".career_image": {
            [theme.fn.smallerThan("md")]: {
                height: "auto",
                width: "100%",
            },
        },
    },
    benefit_section: {
        "& h2": {
            fontWeight: 600,
            fontSize: 24,
            marginBottom: 12,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[5]
                    : theme.colors.gray[8],
        },
        "& p": { color: `${theme.colors.gray[6]}` },
    },
    jobopening: {
        marginTop: 100,
        "& h2": {
            fontWeight: 600,
            marginBottom: 32,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[5]
                    : theme.colors.gray[8],
        },
    },
}));
