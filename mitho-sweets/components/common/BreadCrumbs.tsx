import { Breadcrumbs, Anchor, useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { GoChevronRight } from "react-icons/go";
import { RiHome3Line } from "react-icons/ri";

type BreadcrumbProps = {
    currentTitle: string;
    items?: { href: string; name: string }[];
    className?: string;
};

const Breadcrumb = ({ currentTitle, items, className }: BreadcrumbProps) => {
    const theme = useMantineTheme();

    return (
        <Breadcrumbs
            separator={<GoChevronRight />}
            styles={{
                breadcrumb: {
                    fontSize: 12,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    textDecoration: "none",

                    // Target the Anchor (<a>) directly
                    "& a": {
                        color: theme.colors.gray[7],


                        "&:hover": {
                            color: "blue", // 👈 hover color works now
                            textDecoration: "none", // no underline
                        },
                    },
                },
                separator: {
                    fontSize: 10,
                    margin: "0 4px",
                    fontWeight: 500,
                    color: theme.colors.gray[6],
                },
            }}
            className={className}
        >
            <Anchor component={Link} href="/">
                <RiHome3Line size={15} />
            </Anchor>

            {items &&
                items.map((item, index) => (
                    <Anchor key={index} component={Link} href={item.href}>
                        {item.name}
                    </Anchor>
                ))}

            {/* Current page (not a link) */}
            <Anchor
                component="span"
                c={theme.colors.gray[6]} // current page text color
                style={{ cursor: "default" }}
            >
                {currentTitle}
            </Anchor>
        </Breadcrumbs>
    );
};

export default Breadcrumb;
