import { createStyles } from "@mantine/core";

export const useOverviewCardStyles = createStyles((theme) => ({
  card: {
    justifyContent: "start",
    alignItems: "flex-start",
    padding: "24px 30px",
    width: 750,
    height: "196px",
    background: theme.colors.gray[0],
    boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
  },
  box: {
    padding: "0px",
    gap: 24,
  },
  group: {
    paddingBottom: "24px",
    gap: 24,
  },
  firstbox: {
    padding: "0px",
    flexDirection: "column",
  },
  secondbox: {
    padding: "0px",
    gap: 36,
    "& p": {
      fontWeight: 400,
      lineHeight: "22px",
    },
  },
  firsttext: {
    fontWeight: 400,
    fontSize: 32,
    lineHeight: "48px",
    color: theme.colors.gray[8],
  },
  secondtext: {
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: 16,
    lineHeight: "24px",
    color: theme.colors.gray[7],
  },
  lowerflex: {
    paddingTop: 23,
    borderTop: `1px solid ${theme.colors.gray[4]}`,
    "& p": {
      fontWeight: 400,
      lineHeight: "22px",
      color: theme.colors.status[0],
    },
  },
}));
