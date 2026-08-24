import { createStyles } from "@mantine/core";
import {colors} from "@react-spring/shared";

export const useCategoryPageStyles = createStyles((theme) => ({
    root: {

        border:

            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[7]}`
                : `1px solid rgba(0, 0, 0, 0.08)`,
        borderRadius: 4,
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
        padding: "24px 28px",
        [theme.fn.smallerThan("md")]: {
            padding: "5px 5px",
        },
    },
    nested: {

        border:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[7]}`
                : `1px solid rgba(0, 0, 0, 0.08)`,
        [theme.fn.smallerThan("md")]: {
            border: `none`,
        },
        padding: 20,
        borderRadius: 4,
        position: "sticky",
        top: 80,
        "& p": {
            display: "flex",
            [theme.fn.largerThan("md")]: {
                display: "none",
            },
            alignItems: "center",
            fontSize: 18,
            marginBottom: 10,
            gap: 8,
        },
    },
    listCard: {

        display: "flex",
        flexDirection:'column',
        justifyContent: "space-between",
        alignItems: "flex-start",
        cursor: "pointer",
        borderRadius: 4,
        width: "100%",
        padding: 20,
        [theme.fn.smallerThan("md")]: {
            padding: 15,
        },
        "& a": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[6],
            fontWeight: 500,
            fontSize: 16,
            "&:hover": {
                color: theme.colors.brand[3],
                transition: "0.3s all ease",
            },
        },

        "&:hover": {
            background:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[7]
                    : 'none',
            transition: "0.8s all ease",
        },

        "& svg": {
            width: 24,
            height: 24,
            strokeWidth:"1.4",
            strokeLinecap:"round",
            strokeLinejoin:"round",
            fill:
                theme.colorScheme === "light"
                    ? theme.colors.white[0]
                    : theme.colors.white[5],
        },
    },
    active: {

        background:
            theme.colorScheme === "dark"
                ? theme.colors.dark[7]
                : theme.colors.homaaleSlate[1],
    },
    accordion: {
        display: "none",
        "& a": {
            color: theme.colors.homaaleSlate[6],
            fontWeight: 500,
            fontSize: 16,
            "&:hover": {
                color: theme.colors.brand[3],
                transition: "0.3s all ease",
            },
        },
        [theme.fn.smallerThan("md")]: {
            display: "block",
        },
    },
    isNested: {
        display: "none",
        [theme.fn.largerThan("md")]: {
            display: "flex",
        },
    },
    // new added for Category sidebar
    navbar: {

        display: 'flex',
        flexDirection: 'column',
        height: "auto",

        overflow: "visible",
        backgroundColor: theme.colors.gray[0],
        padding: theme.spacing.md,
        borderRight: `1px solid ${theme.colors.gray[3]}`,

        fontSize: "0.8rem", // Scale down text
        "& svg": {
            width: "24px", // Scale down icons
            height: "24px",
        },

    },
    header: {
        marginBottom: theme.spacing.md,

    },
    links: {
        flex: 1,
        maxHeight:'none',
        overflowY: 'visible',
        border:'2px solid red',


    },
    linksInner: {

        padding: theme.spacing.md,
    },
    footer: {
        marginTop: theme.spacing.md,
    },
    subCategoryContainer: {

        marginTop: theme.spacing.xs,
        paddingLeft: 0,
        borderLeft: `none`,
        position:"relative",
        marginLeft:"10px"

    },
    subCategory: {

        display: "block", // Each subcategory is on a new line
        marginTop: theme.spacing.xs, // Add spacing between subcategories
        padding: `${theme.spacing.xs}px 0`, // Adjust padding for readability
        
        "&:hover": {
            backgroundColor: theme.colors.gray[0], //

        },
    },
}));
