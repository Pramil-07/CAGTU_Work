import { Box, Flex, Grid, Group, Menu, useMantineTheme } from "@mantine/core";
import { IconArrowRight, IconCategory2 } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import parse from "html-react-parser";
import Link from "next/link";
import { useState } from "react";

import urls from "@/constants/urls";
import type { CategoryDropdownProps } from "@/types/CategoryDropdownProps";
import { axiosClient } from "@/utils/axiosClient";

const CategoryDropdown = () => {
    const theme = useMantineTheme();

    const [isClicked, setIsClicked] = useState(false);

    const { data, isLoading } = useQuery<CategoryDropdownProps>(
        ["category-dropdown"],
        async () => {
            try {
                const { data } = await axiosClient.get<CategoryDropdownProps>(
                    `${urls.category.dropdown}?page_size=8`
                );
                return data;
            } catch (error) {
                if (error instanceof AxiosError) {
                    const errors = Object.values(error.response?.data).join(
                        "\n"
                    );
                    throw new Error(errors);
                }
                throw new Error("Something went wrong");
            }
        },
        {
            enabled: isClicked,
        }
    );

    return (
        <Group position="center">
            <Menu
                width={"60%"}
                position="bottom"
                transitionProps={{ transition: "pop" }}
                id="profile-menu"
                trigger="hover"
                offset={20}
            >
                <Menu.Target>
                    <Flex
                        gap={10}
                        sx={{
                            cursor: "pointer",
                            "&:hover": {
                                color: theme.colors.brand[3],
                                transition: "all 0.3s ease",
                            },
                        }}
                        onMouseEnter={() => setIsClicked(true)}
                    >
                        <IconCategory2 size={22} /> Browse Categories
                    </Flex>
                </Menu.Target>
                <Menu.Dropdown
                    sx={{ boxShadow: "0px 4px 14px rgba(33, 29, 79, 0.1)" }}
                >
                    <Grid gutter={20} p={16}>
                        {!isLoading &&
                            data?.result?.map((item, index) => (
                                <Grid.Col
                                    md={4}
                                    sm={6}
                                    key={index}
                                    sx={{
                                        "& figure": {
                                            margin: "0 8px 0 ",
                                        },
                                    }}
                                >
                                    <Link
                                        href={`/services?category=${item?.slug}&category_name=${item?.name}`}
                                    >
                                        <Flex
                                            justify={"flex-start"}
                                            align={"center"}
                                            gap={5}
                                        >
                                            <figure>
                                                {item?.icon
                                                    ? parse(item?.icon)
                                                    : parse(
                                                          `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M144 0C170.5 0 192 21.49 192 48V144C192 170.5 170.5 192 144 192H48C21.49 192 0 170.5 0 144V48C0 21.49 21.49 0 48 0H144ZM144 48H48V144H144V48ZM144 256C170.5 256 192 277.5 192 304V400C192 426.5 170.5 448 144 448H48C21.49 448 0 426.5 0 400V304C0 277.5 21.49 256 48 256H144ZM144 304H48V400H144V304ZM256 48C256 21.49 277.5 0 304 0H400C426.5 0 448 21.49 448 48V144C448 170.5 426.5 192 400 192H304C277.5 192 256 170.5 256 144V48ZM304 144H400V48H304V144ZM352 240C365.3 240 376 250.7 376 264V328H440C453.3 328 464 338.7 464 352C464 365.3 453.3 376 440 376H376V440C376 453.3 365.3 464 352 464C338.7 464 328 453.3 328 440V376H264C250.7 376 240 365.3 240 352C240 338.7 250.7 328 264 328H328V264C328 250.7 338.7 240 352 240Z" fill="white"/>
                                  </svg>`
                                                      )}
                                            </figure>
                                           <Box  >
                                            {item?.name}
                                            </Box> 
                                        </Flex>
                                    </Link>
                                </Grid.Col>
                            ))}
                        <Grid.Col md={4} display={"flex"}>
                            <Link
                                href={`/category/`}
                                style={{ marginLeft: 15 }}
                            >
                                View More <IconArrowRight size={22} />
                            </Link>
                        </Grid.Col>
                    </Grid>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
};
export default CategoryDropdown;
