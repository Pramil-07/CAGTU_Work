import { createStyles } from "@mantine/core";

/**
 * Use This Styles for Calendar(Not Interactive)
 */
export const useCalendarStyles = createStyles((theme) => ({
    main: {
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
        border:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[7]}`
                : `1px solid rgba(0, 0, 0, 0.08)`,
        marginTop: "100px",
        borderRadius: 6,
        padding: 16,
        a: {
            color:
                theme.colorScheme === "dark" ? theme.colors.dark[0] : "#64748b",
        },
        ".fc-toolbar-chunk": {
            ".fc-today-button": {
                textTransform: "capitalize",
            },
        },
        ".fc-theme-standard .fc-scrollgrid": {
            border: "none",
            "& th": {
                border: "none",
            },
            "& td": {
                border: "none",
            },
        },
        ".fc .fc-daygrid-body-natural .fc-daygrid-day-events": {
            display: "flex",
            justifyContent: "center",
            marginBlock: 2,
        },
        ".fc-day-today": {
            background:
                theme.colorScheme === "dark"
                    ? `${theme.colors.dark[6]} !important`
                    : `#fff !important`,
            ".fc-daygrid-bg-harness": {
                background: "#fff",
                ".fc-highlight": {
                    background: `${theme.colors[theme.primaryColor][2]}`,
                },
            },
        },
        ".fc-day-past": {
            background:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[4]
                    : `${theme.colors.homaaleSlate[1]} !important`,
        },
        ".fc-day-other": {
            background:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[4]
                    : `${theme.colors.homaaleSlate[1]}`,
            ".fc-highlight": {
                background: "#E1F1F7 !important",
            },
        },
        ".fc-day-future": {
            ".fc-daygrid-bg-harness": {
                background: "#fff",
                ".fc-highlight": {
                    background: `${theme.colors[theme.primaryColor][2]}`,
                },
            },
        },
    },
    day: {
        justifyContent: "center",
        ".fc-daygrid-day-top": {
            justifyContent: "center",
        },
    },
    event: {
        justifyContent: "center",
        display: "content",
        alignItems: "center",
        textAlign: "center",
        background: "#fff !important",
        "&:hover": {
            background: `${theme.colors[theme.primaryColor][2]} !important`,
            transition: "0.3s ease",
        },
        ".fc-daygrid-day-top": {
            color: "red",
            justifyContent: "center",
        },
    },
}));
