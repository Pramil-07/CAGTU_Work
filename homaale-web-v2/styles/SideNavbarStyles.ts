import { createStyles } from "@mantine/core";

export const useSideNavbarStyles = createStyles((theme) => ({
    root: {

        background:
            theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.white[0],
    },
    figure: {
        margin: 0,
        padding: "0 32px",
        display: "block",
        [theme.fn.smallerThan("md")]: {
            display: "none",
        },
    },
    main: {
        margin: "40px 0 0",
        [theme.fn.smallerThan("md")]: {
            margin: "10px 0 0",
        },
        width: "100%",
    },
    navWrapper: {
        borderTop:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[7]}`
                : "1px solid rgba(0, 0, 0, 0.08)",
        padding: "21px 0 9px 0",
        
    },
    navHeader: {
        color:
            theme.colorScheme === "dark"
                ? theme.colors.gray[0]
                : theme.colors.homaaleSlate[5],
        cursor: "pointer",
        padding: "0 30px 0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        // "&:hover": {
        //     color:
        //         theme.colorScheme === "dark"
        //             ? theme.colors.homaaleSlate[5]
        //             : theme.colors[theme.primaryColor][4],
        //     transition: "0.2s ease",
        // },
    },
    navCollapse: {
        padding: "22px 0 0 0",
    },
    navChevron: {
        transition: "0.50s ease",
    },
    active: {
        transform: "rotate(90deg)",
    },
}));
