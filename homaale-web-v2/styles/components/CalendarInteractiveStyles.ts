import { createStyles } from "@mantine/core";

/**
 * Use This Styles for CalendarInteractive (Interactive)
 */
export const useCalendarInteractiveStyles = createStyles((theme) => ({
    main: {
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
        boxShadow:
            theme.colorScheme === "dark"
                ? "none"
                : `6px 0px 18px rgba(163, 171, 185, 0.2)`,
        borderRadius: 6,
        padding: 40,
        [theme.fn.smallerThan("lg")]: {
            padding: 16,
        },
        a: {
            color:
                theme.colorScheme === "dark" ? theme.colors.dark[0] : "#64748b",
        },
        ".fc-toolbar-chunk": {
            ".fc-today-button": {
                textTransform: "capitalize",
            },
        },

        ".fc .fc-daygrid-body-natural .fc-daygrid-day-events": {
            display: "flex",
            justifyContent: "center",
            marginBlock: 2,
        },
        ".fc-day-today": {
            ".fc-daygrid-day-frame": {
                ".fc-daygrid-day-top": {
                    "& a": {
                        color: `#5fcbd7`,
                    },
                },
            },
            background: `${theme.colors.homaaleSlate[1]} !important`,
            ".fc-daygrid-bg-harness": {
                ".fc-highlight": {
                    background: `${theme.colors.brand[2]}`,
                },
            },
        },
        ".fc-day-past": {
            background:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[5]
                    : `${theme.colors.homaaleSlate[1]} !important`,
        },
        ".fc-day-other": {
            background:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[5]
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
        background:
            theme.colorScheme === "dark"
                ? theme.colors.dark[7]
                : `${theme.colors.homaaleSlate[1]}`,
        ".fc-daygrid-day-top": {
            justifyContent: "flex-end",
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
