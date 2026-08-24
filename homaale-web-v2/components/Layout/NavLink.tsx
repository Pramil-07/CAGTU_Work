import { Box, Text, useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import type { NavLinkProps } from "@/types/NavLinkProps";
import { useDark } from "@/utils/helpers";

export const NavLink = ({ icon, link, title, id }: NavLinkProps) => {
  const dark = useDark();
  const theme = useMantineTheme();
  const router = useRouter();

  // Determine if this is a sub-item (links with "/" but not "/#")
  const isSubItem = link.includes("/") && link !== "/#";
  const isActive = router.pathname.includes(link);

  return (
    <Link href={link}>
      <Box
        id={id}
        sx={(theme) => ({
          color: isActive
            ? theme.colors[theme.primaryColor][4] // Active color from original
            : dark
            ? theme.colors.dark[0]
            : theme.colors.homaaleSlate?.[5] ?? theme.colors.gray[7],
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          marginLeft:40,
        
          padding: "0 32px 12px 30px", // Original padding for top, right, bottom
          paddingLeft: isSubItem
            ? `calc(${theme.spacing.md}px + 2px)` // Reduced padding to bring content closer to the orange line
            : "30px", // Original padding for main items
          // Vertical orange line for active sub-items only
          borderLeft: isSubItem && isActive
            ? `2px solid ${theme.colors.brand[4]}` // Orange line
            : "2px solid lightgrey", // No line for inactive sub-items or main items
          "&:hover": {
            color: theme.colors[theme.primaryColor][4], // Original hover color
            ".text": {
              color: theme.colors[theme.primaryColor][4],
            },
          },
          
          transition: "color 0.2s ease", // Smooth transition for hover
        })}
      >
      {React.cloneElement(icon as React.ReactElement, { size: 20 })} 
        <Text
          ml={8}
          size="sm"
          weight={isActive ? 400 : 400} // Bolder for active items
          className="text"
          sx={{
            color: isActive
              ? theme.colors[theme.primaryColor][4]
              : dark
              ? theme.colors.dark[0]
              : "inherit",
          }}
        >
          {title}
        </Text>
      </Box>
    </Link>
  );
};