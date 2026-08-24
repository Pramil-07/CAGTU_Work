import type { MantineThemeOverride } from "@mantine/core";
import { Poppins,Roboto } from "@next/font/google";
export const poppins = Poppins({
    weight: ["300", "400", "500", "600", "700"],
    style: ["normal", "italic"],
    subsets: ["latin"],
});

export const homaaleColors: MantineThemeOverride = {
    fontFamily: "Poppins",
    fontSizes: { md: "14px" },
    headings: {
        fontFamily: "Poppins",
    },
    colors: {
        brand: [
            "#fff2db",
            "#ffdbaf",
            "#FFCA6A",
            "#fbae50",
            "#f9971f",
            "#e07e06",
            "#ae6202",
            "#7d4600",
            "#4d2900",
            "#1e0c00",
            
        ],
        secondary: [
            "#9CA0C1",
            "#5C6096",
            "#3D3F7D",
            "#2D2D66",
            "#211D4F",
            "#211F43",
            "#211F39",
            "#201E31",
            "#1E1D2A",
            "#1C1B25",
        ],
        socialicons: [
            "#FE5050",
            "#1B3874",
            "#4267B2",
            "#E83655",
            "#1DA1F2",
            "#F83636",
            "#F97316",
            "#EAB308",
            "#6366F1",
            "#1E293B",
        ],
        product:["#F97316"],
        status: ["#3EAEFF", "#FE5050", "#fbae50"],
        white: ["#FFFFFF", "#000000"],
        secondaryColor: ["#211D4F", "#FFF5E5"],
        homaaleGrey: ["#F9FAFB"],
        darkBackground: ["#25262b"],
        homaaleSlate: [
            "#f8fafc",
            "#f1f5f9",
            "#e2e8f0",
            "#cbd5e1",
            "#94a3b8",
            "#64748b",
            "#475569",
            "#334155",
            "#1e293b",
            "#0f172a",
        ],
    },
    breakpoints: {
        xxs: "",
        xs: "576",
        sm: "768",
        md: "992",
        lg: "1200",
        xl: "1400",
        xxl: "",
    },
    primaryColor: "brand",
    primaryShade: 4,
    globalStyles: (theme) => ({
        h1: {
            margin: 0,
            fontSize: "32px",
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[0]
                    : theme.colors.homaaleSlate[8],
            [`@media (max-width: ${theme.breakpoints.md}px)`]: {
                fontSize: "28px",
            },
        },
        h2: {
            margin: 0,
            fontSize: "24px",
            fontWeight: 400,
            [`@media (max-width: ${theme.breakpoints.md}px)`]: {
                fontSize: "26px",
            },
        },
        h3: {
            margin: 0,
            fontSize: "18px",
        },
        h4: {
            margin: "0px 0px 8px 0px",
            fontSize: "16px",
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[2]
                    : theme.colors.homaaleSlate[8],
        },
        h5: {
            margin: 0,
            fontSize: "14px",
        },
        h6: {
            margin: 0,
            fontSize: "1px",
        },
        p: {
            margin: 0,
            fontSize: 14,
            color: theme.colors.gray[7],
        },
        // button: {
        //     span: {
        //         fontWeight: 400,
        //     },
        // },
        a: {
            color: theme.colors[theme.primaryColor][4],
            textDecoration: "none",
            "&:hover": {
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors[theme.primaryColor][5]
                        : theme.colors[theme.primaryColor][5],
                transition: "all 0.3s ease",
            },
        },
        ".form-check-input": {
            height: 16,
            width: 16,
            marginRight: 6,
        },
        ".asterisk": {
            color: theme.colors.red[4],
        },
        ".invalid-feedback": {
            fontSize: 12,
            fontWeight: 400,
            display: "block",
            color: theme.colors.red[4],
        },

        ".form-control": {
            background: "#fff",
            border:
                theme.colorScheme === "dark"
                    ? `1px solid ${theme.colors.dark[4]}`
                    : `1px solid ${theme.colors.gray[4]}`,
            boxShadow: "none",
            minHeight: "42px",
            fontSize: 16,
            padding: "0 18px",
            position: "relative",
            borderRadius: 8,
            marginTop: 6,
        },
        ".mantine-Modal-header": {
            position: "relative",
        },
        ".form-group": {
            marginBottom: 24,
            ".is-invalid": {
                border: `1px solid ${theme.colors.red[4]}`,
            },
            ":has(.is-invalid)": {
                ".PhoneInputInput": {
                    color: theme.colors.red[4],
                },
            },
            ".PhoneInput": {
                display: "flex",
                alignItems: "center",
                background:
                    theme.colorScheme === "dark"
                        ? theme.colors.darkBackground[0]
                        : "inherit",
                // margin: "0 0 24px",
                ".PhoneInputCountry": {
                    height: 35,
                    marginBlock: "auto",
                    marginRight: 10,
                    position: "relative",
                    alignSelf: "stretch",
                    display: "flex",
                    alignItems: "center",

                    ".PhoneInputCountrySelect": {
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: "100%",
                        zIndex: 1,
                        border: 0,
                        opacity: 0,
                        cursor: "pointer",
                        background: "#fff",
                    },
                },

                ".PhoneInputInput": {
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: "0%",
                    border: "none",
                    outline: "none",
                    height: "100%",
                    width: "100%",
                    minWidth: 0,
                    background: "transparent",
                },
            },
            ".PhoneInput--disabled": {
                background: "#f1f3f5",
                color: "#909296",
                opacity: 0.6,
                cursor: "not-allowed",
            },
        },
    }),
    components: {
        Flex: {
            defaultProps: {
                justify: "space-between",
                align: "center",
            },
        },
        Grid: {
            defaultProps: {
                gutter: 30,
            },
        },
        // Container: {
        //     defaultProps: {
        //         sizes: {
        //             xs: 540,
        //             sm: 720,
        //             md: 1140,
        //             lg: 1140,
        //             xl: 1320,
        //         }
        //     }
        // }
    },
};
