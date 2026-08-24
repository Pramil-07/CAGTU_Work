import {Alert, Button, Flex} from "@mantine/core";
import {Select} from "@mantine/core";
import {TextInput} from "@mantine/core";
import {IconAlertCircle, IconArrowRight, IconSearch} from "@tabler/icons-react";
import {Form, Formik} from "formik";
import {useRouter} from "next/router";
import * as Yup from "yup";
import {useDark} from "@/utils/helpers";
import {useMantineTheme} from "@mantine/core";

import {SEARCH_SELECT, SEARCH_SELECT_TYPES} from "@/constants/SearchSelect";
import {setQuery, setSearch} from "@/features/utils/filterSlice";
import {useAppDispatch} from "@/hooks";
import {useEffect, useState} from "react";
import {useMediaQuery} from "@mantine/hooks";
import layout from "@/components/Layout/Layout";
import Link from "next/link";
import {useBrandData} from "@/brand/BrandContext";
import FloatingAiButton from "@/components/floatButton";
import FloatingButton from "@/components/floatButton";

// Map SEARCH_SELECT_TYPES to filterSlice searchType values
const searchTypeMap: Record<string, string> = {
    [SEARCH_SELECT_TYPES.all]: "",
    [SEARCH_SELECT_TYPES.service]: "services",
    [SEARCH_SELECT_TYPES.task]: "tasks",
    [SEARCH_SELECT_TYPES.tasker]: "taskers",
    [SEARCH_SELECT_TYPES.product]: "products",
    [SEARCH_SELECT_TYPES.shop]: "shops",
};

export const SearchBar = ({inLayout}:{inLayout?:boolean|null}) => {
    const [isSticky, setIsSticky] = useState<boolean>(false)
    const [showSearch, setShowSearch] = useState<boolean>(false)
    const router = useRouter();
    const dispatch = useAppDispatch();
    const dark = useDark();
    const theme = useMantineTheme();
    const {brandData} = useBrandData();
    const mobileview = useMediaQuery("(max-width: 768px)")

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;

           !inLayout&& setIsSticky( scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    // console.log("first,",inLayout)

    return (
        <Formik
            initialValues={{
                search: "All",
                select: "all",
            }}
            validationSchema={Yup.object().shape({
                search: Yup.string()
                    .min(3, "Minimum of three characters required")
                    .required("Please fill the search field"),
            })}

            onSubmit={(data) => {
                const selectedType = searchTypeMap[data.select] || "";
                dispatch(setQuery({key: "searchType", value: selectedType}));
                dispatch(setSearch(data.search))
                switch (data?.select) {
                    case SEARCH_SELECT_TYPES.all:
                        router?.push({
                            pathname: "/explore",
                            query: {search: data.search},
                        });
                        dispatch(setSearch(data.search));
                        break;
                    case SEARCH_SELECT_TYPES.service:
                        router?.push({
                            pathname: "/explore",
                            query: {type: "services", search: data.search},
                        });
                        dispatch(setSearch(data.search));
                        break;
                    case SEARCH_SELECT_TYPES.task:
                        router?.push({
                            pathname: "/explore",
                            query: {type: "task", search: data.search},
                        });
                        dispatch(setSearch(data.search));
                        break;

                    case SEARCH_SELECT_TYPES.tasker:
                        router?.push({
                            pathname: "/tasker",
                            query: {search: data.search},
                        });
                        dispatch(setSearch(data.search));
                        break;
                    case SEARCH_SELECT_TYPES.product:
                        router.push({
                            pathname: "/products",
                            query: {type: "product", name: data.search},
                        });
                        dispatch(setSearch(data.search));
                        break;
                    case SEARCH_SELECT_TYPES.shop:
                        router.push({
                            pathname: "/shops",
                            query: {type: "shop", name: data.search},
                        });
                        dispatch(setSearch(data.search));
                        break;
                    default:
                        router?.push("/explore");
                        dispatch(setSearch(data.search));
                        break;
                }
            }}
        >
            {({values, setFieldValue, errors, touched}) => (
                <Form>
                    <Flex
                        align="center"
                        gap="sm"
                        // pos="relative"
                        className={`transition-all duration-400 ${
                            isSticky && !mobileview ? `fixed top-2 left-72 z-50` : `relative`
                        }`}

                    >
                        {/* Search box */}
                        <Flex
                            // className={`transition-all duration-400 ${
                            //     isSticky && !mobileview
                            //         ? `fixed top-2 left-72 ${
                            //             isSticky && dark ? theme.colors.dark[4] : `bg-white`
                            //         } z-50`
                            //         : `relative`
                            // }`}
                            w={{base: isSticky ? "50%" : "100%", md: isSticky ? "90%" : "120%"}}
                            justify={isSticky ? "center" : "flex-start"}
                            wrap={{base: "wrap", xs: "nowrap"}}
                            sx={(theme) => ({
                                border: `0.5px solid ${
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[7]
                                        : theme.colors.gray[4]
                                }`,
                                boxShadow: `0px 8px 40px rgba(0, 0, 0, 0.04)`,
                                borderRadius: inLayout ? 40 : 8,
                                background:
                                    theme.colorScheme === "dark" ? theme.colors.dark[6] : "#fff",
                            })}
                        >
                            {!inLayout && (
                                <Select
                                    name="select"
                                    radius="md"
                                    size="sm"
                                    w={{base: "50%", xs: "30%"}}
                                    pl={4}
                                    value={values.select}
                                    onChange={(value) => setFieldValue("select", value)}
                                    sx={(theme) => ({
                                        "& input": {border: "none"},
                                        borderRight:
                                            theme.colorScheme === "dark"
                                                ? `1px solid rgba(255, 255, 255, 0.3)`
                                                : `1px solid rgba(0, 0, 0, 0.08)`,
                                    })}
                                    data={SEARCH_SELECT}
                                />
                            )}

                            <div style={{position: "relative", width: "100%"}}>
                                <TextInput
                                    name="search"
                                    w="100%"
                                    icon={<IconSearch size={20} color={dark ? "white" : "black"}/>}
                                    placeholder={inLayout ? "Search" : "Search for anything"}
                                    sx={(theme) => ({
                                        "& input": {
                                            border: "none",
                                            fontSize: 15,
                                            borderRadius: inLayout ? 40 : 6,
                                            color: dark ? "white" : "black",
                                            background: theme.colorScheme === "dark" ? theme.colors.dark[4] : "white",
                                            paddingRight: 40, // space for the arrow
                                        },
                                    })}
                                    onChange={(e) => setFieldValue("search", e.currentTarget.value)}
                                    radius="sm"
                                    size="sm"
                                />

                                <button
                                    type="submit"
                                    style={{
                                        background: "transparent",
                                        position: "absolute",
                                        right: 10,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    <IconArrowRight className="icon"/>
                                </button>
                            </div>

                        </Flex>

                        {!mobileview && (
                            // <Link
                            //     href="/ai"
                            //     style={{
                            //         color: dark ? theme.colors.blue[2] : theme.colors.blue[6],
                            //         fontSize: "14px",
                            //         textDecoration: "underline",
                            //         whiteSpace: "nowrap",
                            //     }}
                            // >
                            //     Try Homaale AI
                            // </Link>
                            // <Button
                            //     sx={{ fontWeight: 400 }}
                            //     onClick={() => {
                            //             router.push({
                            //                 pathname: "/ai",
                            //             });
                            //     }}
                            // >
                            //     Try {brandData.name} AI
                            // </Button>
                            <FloatingButton brandData={brandData.name}/>
                        )}

                    </Flex>
                    {errors.search && touched.search&& !inLayout && (
                        <Alert mt={10}>
                            <Flex gap={10} justify={"flex-start"}>
                                <IconAlertCircle size="1.2rem"/>
                                {errors.search}
                            </Flex>
                        </Alert>
                    )}
                </Form>
            )}
        </Formik>
    );
};
