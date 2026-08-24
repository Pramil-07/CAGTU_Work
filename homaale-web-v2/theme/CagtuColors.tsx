import type { MantineThemeOverride } from "@mantine/core";
import { Poppins } from "@next/font/google";

export const cagtuColors: MantineThemeOverride = {
  fontFamily: "Poppins",
  fontSizes: { md: "14px" },
  headings: {
    fontFamily: "Poppins",
  },
  colors: {
    brand: [
      "#e0f2ff",
      "#b3e0ff",
      "#80ceff",
      "#4dbbff",
      "#1aa9ff", // primary blue
      "#008ee6",
      "#006bb3",
      "#004780",
      "#00244d",
      "#001022",
    ],
    secondary: [
      "#A0AEC0",
      "#718096",
      "#4A5568",
      "#2D3748",
      "#1A202C",
      "#171923",
      "#14161E",
      "#11131A",
      "#0E1015",
      "#0B0D11",
    ],
    socialicons: [
      "#1877F2",
      "#1DA1F2",
      "#0077B5",
      "#0e76a8",
      "#1B3874",
      "#2C82C9",
      "#6366F1",
      "#4F46E5",
      "#3B82F6",
      "#1E3A8A",
    ],
    product:["#1aa9ff"],
    status: ["#3EAEFF", "#E53E3E", "#1aa9ff"],
    white: ["#FFFFFF", "#000000"],
    secondaryColor: ["#1A202C", "#EBF8FF"],
    homaaleGrey: ["#F9FAFB"],
    darkBackground: ["#1A202C"],
    homaaleSlate: [ // reuse this key to avoid breaking things, or rename
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
          : theme.colors.brand[6],
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
          : theme.colors.brand[6],
    },
    p: {
      margin: 0,
      fontSize: 14,
      color: theme.colors.gray[7],
    },
    a: {
      color: theme.colors[theme.primaryColor][4],
      textDecoration: "none",
      "&:hover": {
        color: theme.colors[theme.primaryColor][5],
        transition: "all 0.3s ease",
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
  },
};
