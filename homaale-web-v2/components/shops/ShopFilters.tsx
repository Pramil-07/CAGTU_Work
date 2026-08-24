import {TextInput, Select, Button, ActionIcon, Box, Menu, Drawer, Tooltip, Flex} from '@mantine/core';
import {CSSObject} from '@mantine/core';
import {axiosClient} from "@/utils/axiosClient";
import {useEffect, useState} from "react";
import {IconChevronDown, IconChevronUp, IconExternalLink, IconFilter, IconX} from "@tabler/icons-react";
import {useFilterStyles} from "@/styles/components/FilterStyles";
import {useMantineTheme} from "@mantine/core";
import {useDark} from "@/utils/helpers";
import router, {useRouter} from "next/router";
import {setQuery, setSearch} from "@/features/utils/filterSlice";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store";
import {useMediaQuery} from "@mantine/hooks";
import { FaSlidersH } from 'react-icons/fa';
import { useBrandData } from '@/brand/BrandContext';

interface Category {
    id: string;
    name: string;
}

interface FilterComponentProps {
    searchMerchant: string;
    setSearchMerchant: (value: string) => void;
    selectedCategory: any;
    // setSelectedCategory: (value: string | null) => void;
    setPage: (page: number) => void;
    sortOrder: string | null;
    setSortOrder: (value: string | null) => void;
    minRating: string | null;
    setMinRating: (value: string | null) => void;
    handleCategoryClick: any;
    drawerContent: any;
    drawerOpen: any;
    setDrawerOpen: any;
    childCategoryId: any;
    childCategoryName: any;
    cities: { label: string; value: string }[];
    // setCities: (cities: { label: string; value: string }[]) => void;
    selectedCity: string | null;
    setSelectedCity: (value: string | null) => void;
}

// Rating options from ProductFilter.tsx
const RATING_OPTIONS = [
    {value: '0', label: 'Any Rating'},
    {value: '1', label: '1 & Above'},
    {value: '2', label: '2 & Above'},
    {value: '3', label: '3 & Above'},
    {value: '4', label: '4 & Above'},
    {value: '5', label: '5 Only'}
];

const ShopFilters: React.FC<FilterComponentProps> = ({
                                                         searchMerchant,
                                                         setSearchMerchant,
                                                         selectedCategory,
                                                         // setSelectedCategory,
                                                         setPage,
                                                         sortOrder,
                                                         setSortOrder,
                                                         childCategoryId,
                                                         childCategoryName,
                                                         minRating,
                                                         setMinRating,
                                                         handleCategoryClick,
                                                         drawerContent,
                                                         drawerOpen,
                                                         setDrawerOpen,
                                                         cities,
                                                         // setCities,
                                                         selectedCity,
                                                         setSelectedCity,
                                                     }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [ratingMenuOpen, setRatingMenuOpen] = useState(false);
    const {classes, cx} = useFilterStyles();
    const theme = useMantineTheme();
    const is_dark = useDark();
    const {query} = useRouter();
    const dispatch = useDispatch();
    const filterState = useSelector((state: RootState) => state.filterReducer);
    const {brandData}= useBrandData();

    const inputStyles = {
        input: {
            height: '35px',
            borderRadius: brandData.radius,
            paddingLeft: '16px',
            fontSize: '14px',
            width: '15rem'
        } as CSSObject
    };

    const filterContainerStyles: CSSObject = {
        height: '35px',
        borderRadius: brandData.radius,
        paddingLeft: '16px',
        paddingRight: '8px',
        fontSize: '14px',
        width: '12rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: `1px solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
        }`,
        cursor: 'pointer',
    };
    // Sync searchMerchant with filterSlice and router.query.name
    useEffect(() => {
        if (query.name) {
            // Set searchMerchant from URL (e.g., name=Book from SearchBar)
            const term = query.name as string;
            setSearchMerchant(term);
            // Update filterSlice with search term
            dispatch(setSearch(term));
            // Set searchType to shops
            dispatch(setQuery({key: "searchType", value: "shops"}));
        } else if (filterState.search) {
            // Set searchMerchant from filterSlice (e.g., &name=Book)
            const term = filterState.search.replace(/(&name=|&search=)/, "");
            setSearchMerchant(term);
        }
    }, [query.name, filterState.search, setSearchMerchant, dispatch]);
    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get<Category[]>("/product/list-category/");
            setCategories(response.data);
        } catch (error) {
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSortToggle = () => {
        const nextSort = sortOrder === "asc"
            ? "desc"
            : sortOrder === "desc"
                ? null
                : "asc";
        setSortOrder(nextSort);
        setPage(1);
    };

    const closeDrawer = () => setDrawerOpen(false);

    const handleSelectRating = (value: string) => {
        setMinRating(value);
        setRatingMenuOpen(false);
        setPage(1);
    };

    const clearRatingFilter = () => {
        setMinRating(null);
        setPage(1);
    };

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
    }));
    const [showFilters, setShowFilters] = useState(true);
    const smallScreen = useMediaQuery("(max-width: 991px)");
    useEffect(() => {
        if (!smallScreen) {
            setShowFilters(true);
        }
        else {
            setShowFilters(false);
        }
    }, [smallScreen]);
    return (
        <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '16px'
        }}>
            <Drawer
                opened={drawerOpen}
                onClose={closeDrawer}
                position="right"

                size="l"
                zIndex={1000}
                withCloseButton={false}
                styles={{
                    content: {
                        backgroundColor: is_dark ? theme.colors.dark[7]
                            : theme.colors.homaaleSlate[0],
                    },
                    overlay: {
                        backgroundColor: '',
                    },
                }}
            >
                {/* <h1>Category SideBar</h1> */}
                {drawerContent}
            </Drawer>
            <TextInput
                placeholder="Search"
                value={searchMerchant}
                onChange={(e) => {
                    const value = e.currentTarget.value;
                    setSearchMerchant(value);
                    dispatch(setSearch(value)); // Sync with filterSlice
                    setPage(1);
                }}
                size="sm"
                styles={inputStyles}
            />
            {smallScreen && (
            <Tooltip label={showFilters ? "Hide Filters" : "Show Filters"} withArrow>
                <Button
                    // size="md"
                    radius="xl"
                    variant={showFilters ? "filled" : "outline"}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <IconFilter size={16}/>
                </Button>
            </Tooltip>
        )}
            {/*<Select*/}
            {/*    placeholder="Search Category"*/}
            {/*    value={selectedCategory}*/}
            {/*    onChange={(value) => {*/}
            {/*        setSelectedCategory(value);*/}
            {/*        setPage(1);*/}
            {/*    }}*/}
            {/*    data={categoryOptions}*/}
            {/*    searchable*/}
            {/*    clearable*/}
            {/*    size="sm"*/}
            {/*    disabled={isLoading}*/}
            {/*    styles={inputStyles}*/}
            {/*/>*/}
            {showFilters && (
                <Flex   justify={"flex-start"}
                        align={"center"}
                        wrap={"wrap"}
                        gap={"xs"}>

            <Box style={{position: "relative"}}>
                <Button
                    radius={brandData.radius}
                    variant={query?.category ? "filled" : "default"}
                    className={cx(classes.root, {
                        [classes.activeSort]: query?.category_id || childCategoryId,
                    })}
                    onClick={handleCategoryClick}
                    w={"100%"}
                >
                    {childCategoryId
                        ? childCategoryName
                        : query?.category_name
                            ? query?.category_name
                            : 'Select Category'}{' '}{" "}
                    <IconExternalLink
                        size={16}
                        style={{margin: "0 10px 0 5px"}}
                    />
                </Button>
                {selectedCategory && (
                    <ActionIcon
                        size={20}
                        variant={"transparent"}
                        className={classes.crossBtn}
                        onClick={() => router.replace(router.pathname)}
                    >
                        <IconX size={14}/>
                    </ActionIcon>
                )}
            </Box>
            {/* Sort Date Filter */}
            <Box className="w-36 "
                sx={{
                    ...filterContainerStyles,
                    backgroundColor: sortOrder
                        ? theme.colors[theme.primaryColor][5]
                        : theme.colorScheme === 'dark'
                            ? theme.colors.dark[6]
                            : theme.colors.white[0],
                    color: sortOrder
                        ? theme.white
                        : theme.colorScheme === 'dark'
                            ? theme.colors.dark[0]
                            : theme.black,
                }}
                onClick={handleSortToggle}
            >
                <span style={{
                    color:
                        theme.colorScheme === 'dark'
                            ? theme.colors.dark[3]
                            : theme.colors.gray[6],
                }}>Sort Date</span>
                <Box style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    {sortOrder === "asc" ? (
                        <IconChevronUp size={16}/>
                    ) : (
                        <IconChevronDown size={16}/>
                    )}
                    {sortOrder && (
                        <ActionIcon
                            size={18}
                            variant="transparent"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSortOrder(null);
                                setPage(1);
                            }}
                            color={sortOrder ? 'white' : theme.colorScheme === 'dark' ? 'gray' : 'dark'}
                        >
                            <IconX size={14} color="white"/>
                        </ActionIcon>
                    )}
                </Box>
            </Box>


            {/* Rating Filter Menu */}
            <Menu
                withArrow
                position="bottom"
                transitionProps={{transition: "pop"}}
                opened={ratingMenuOpen}
                onChange={setRatingMenuOpen}
            >
                <Menu.Target>
                    <Box
                        sx={{
                            ...filterContainerStyles,
                            minWidth: '10rem',
                            maxWidth: '100%',
                            backgroundColor:
                                minRating !== null && minRating !== '0'
                                    ? theme.colors[theme.primaryColor][5]
                                    : theme.colorScheme === 'dark'
                                        ? theme.colors.dark[6]
                                        : theme.colors.white[0],
                            color:
                                minRating !== null && minRating !== '0'
                                    ? theme.white
                                    : theme.colorScheme === 'dark'
                                        ? theme.colors.dark[0]
                                        : theme.black,
                        }}
                    >
            <span
                style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    fontSize: theme.fn.smallerThan('sm') ? '0.85rem' : '0.875rem',
                    color:
                        minRating && minRating !== '0'
                            ? undefined
                            : theme.colorScheme === 'dark'
                                ? theme.colors.dark[3]
                                : theme.colors.gray[6],
                }}
            >
                {minRating && minRating !== '0'
                    ? `Rating: ${minRating}${minRating === '5' ? '★ Only' : '★ & Above'}`
                    : "Filter Rating"}
            </span>
                        <Box style={{display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0}}>
                            <IconChevronDown
                                size={16}
                            />
                            {minRating !== null && minRating !== '0' && (
                                <ActionIcon
                                    size={theme.fn.smallerThan('sm') ? 16 : 18}
                                    variant="transparent"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearRatingFilter();
                                    }}
                                    color="white"
                                >
                                    <IconX size={14} color="white"/>
                                </ActionIcon>
                            )}
                        </Box>
                    </Box>
                </Menu.Target>
                <Menu.Dropdown p={theme.fn.smallerThan('sm') ? 10 : 12}>
                    {RATING_OPTIONS.map((option) => (
                        <Menu.Item
                            key={option.value}
                            onClick={() => handleSelectRating(option.value)}
                            style={{
                                backgroundColor: minRating === option.value
                                    ? (theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2])
                                    : 'transparent',
                                fontSize: theme.fn.smallerThan('sm') ? '0.85rem' : '1rem',
                            }}
                        >
                            {option.label}
                        </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>
                    {/*city*/}
                    <Select
                        placeholder="Select City"
                        value={selectedCity}
                        onChange={(value) => {
                            setSelectedCity(value);
                            setPage(1);
                        }}
                        data={cities.map(city => ({value: city.label , label: city.label}))}
                        searchable
                        clearable
                        size="sm"
                        styles={{
                            input: {
                                height: "35px",
                                borderRadius: brandData.radius,
                                paddingLeft: "16px",
                                fontSize: "14px",
                                width: "9rem"
                            }
                        }}
                        disabled={cities.length === 0}
                    />
                </Flex>
                )}
        </div>
    );
};

export default ShopFilters;
