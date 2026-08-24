import { Anchor, Breadcrumbs, useMantineTheme } from "@mantine/core";
import Link from "next/link";

import type { BreadcrumbProps } from "@/types/BreadCrumbProps";
import { useDark } from "@/utils/helpers";

const Breadcrumb = ({ currentTitle, items }: BreadcrumbProps) => {
    const theme = useMantineTheme();
    const dark = useDark();

    return (
        <Breadcrumbs
            separator={">"}
            styles={{
                breadcrumb: {
                    fontSize: 12,
                    fontWeight: 500,
                    color: theme.colors.homaaleSlate[4],
                    "&:hover": {
                        textDecoration: "none",
                        color: theme.colors[theme.primaryColor][4],
                    },
                },
                separator: {
                    fontSize: 18,
                    margin: `${0} ${7}px`,
                    fontWeight: 500,
                    color: theme.colors.gray[6],
                    
                },
            }}
        >
            <Anchor component={Link} href={"/"} >
                Home
            </Anchor>
            
            {items &&
                items.map((item, index) => (
                    <Anchor key={index} component={Link} href={item.href}>
                        {item.name}
                    </Anchor>
                ))}
            <Anchor
                component="span"
                sx={{
                    color: dark
                        ? theme.colors.gray[0]
                        : theme.colors.homaaleSlate[8],
                    cursor: "text",
                    "&:hover": {
                        color: dark
                            ? theme.colors.gray[0]
                            : theme.colors.dark[6],
                    },
                }}
            >
                {currentTitle}
            </Anchor>
        
        </Breadcrumbs>
    );
};

export default Breadcrumb;
