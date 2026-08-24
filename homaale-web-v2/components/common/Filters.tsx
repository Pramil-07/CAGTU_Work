import {
    ActionIcon,
    Box,
    Button,
    Flex,
    Input,
    Menu,
    RangeSlider,
    Select,
    Text,
    Title,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import {
    IconCalendarEvent,
    IconChevronDown,
    IconChevronUp,
    IconExternalLink,
    IconFilter,
    IconSearch,
    IconX,
} from "@tabler/icons-react";
import {format} from "date-fns";
import {Form} from "formik";
import {Formik} from "formik";
import {debounce} from "lodash";
import {useRouter} from "next/router";
import {useState, useEffect} from "react";

import {REDEEM_STATUS_ARRAY} from "@/constants/REDEEM_STATUS";
import {TASK_STATUS_ARRAY} from "@/constants/TASK_STATUS";
import {TRANSACTION_STATUS_ARRAY} from "@/constants/TRANSACTION_STATUS";
import type {PriceFilterTypes} from "@/features/utils/filterSlice";
import {setQuery, setSearch} from "@/features/utils/filterSlice";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {useCityOption} from "@/hooks/useCityOptions";
import {usePaymentOptions} from "@/hooks/usePaymentOptions";
import {useServiceOption} from "@/hooks/useServiceOptions";
import {useFilterStyles} from "@/styles/components/FilterStyles";
import DateFilterSchema from "@/utils/validation/FilterValidation";

import DateField from "./form/DateField";
import FormButton from "./form/FormButton";
import NumberField from "./form/NumberField";
import {useCategoryOptions} from "@/hooks/useCategoryOptions";
import {useMediaQuery} from "@mantine/hooks";
import { FaSlidersH } from "react-icons/fa";
import {IconFilters} from "@tabler/icons";
import { useBrand } from "@/hooks/useBrand";
import { useBrandData } from "@/brand/BrandContext";

export type FilterProps = {
    search?: boolean;
    services?: boolean;
    location?: boolean;
    sortDate?: boolean;
    sortBudget?: boolean;
    sortTasker?: boolean;
    category?: boolean;
    statusFilter?: boolean;
    statusType?: "transaction" | "booking" | "redeem";
    paymentMethod?: boolean;
    filterDate?: boolean;
    filterBudget?: boolean;
    handleClick?: () => void
    priceType?:
        | PriceFilterTypes.amount
        | PriceFilterTypes.budget
        | PriceFilterTypes.earning
        | PriceFilterTypes.payable
        | PriceFilterTypes.price;
};

export const Filters = ({
                            sortBudget,
                            category,
                            handleClick,
                            sortDate,
                            sortTasker,
                            location,
                            search,
                            services,
                            statusFilter,
                            statusType,
                            paymentMethod,
                            filterDate,
                            filterBudget,
                            priceType,
                        }: FilterProps) => {
    const dispatch = useAppDispatch();

    const {classes, cx} = useFilterStyles();

    const {
        city,
        service,
        date,
        budget,
        status,
        payment_method,
        date_after,
        date_before,
        budget_to,
        budget_from,
        top_tasker,
    } = useAppSelector((state) => state.filterReducer);
    const router = useRouter();

    const theme = useMantineTheme();
    const brand = useBrand()
    const {brandData}= useBrandData()

    const {query} = useRouter();
    const is_product = typeof window !== "undefined" && router.pathname === "/products";
    const is_hotel = router.pathname === "/hotels" || query?.type === "hotels";
    const [dateFilter, setDateFilter] = useState(false);
    const [budgetFilter, setBudgetFilter] = useState(false);

    // To fetch data from api only when user selects the select field
    const [fetchService, setFetchService] = useState(false);
    const {data: serviceOptions = []} = useServiceOption("", fetchService);

    const [fetchCategory, setFetchCategory] = useState<string | null>(null);
    const {data: CategoryOptions = []} = useCategoryOptions();

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

    useEffect(() => {
        const urlSearch = query.search;
        if (typeof urlSearch === "string") {
            dispatch(setSearch(urlSearch));
        } else if (!urlSearch && query.search !== undefined) {
            dispatch(setSearch("")); // Clear if removed from URL
        }
    }, [query.search, dispatch]);
    // To fetch data from api only when user selects the select field
    const [fetchPayment, setFetchPayment] = useState(false);
    const {data: paymentOptions = []} = usePaymentOptions("", fetchPayment);

    // To fetch data from api only when user enters more than 2 characters in the select field
    const [searchCity, setSearchCity] = useState("");
    const {data: cityOptions = []} = useCityOption(searchCity, true);

    const MAX_AMOUNT = 100000;
    const MIN_AMOUNT = 1;

    const numberFormater = Intl.NumberFormat("en", {notation: "compact"});

    const marks = Array.from({length: Math.log10(MAX_AMOUNT)}).map(
        (_, index) => {
            return {
                value: index,
                label: (10 ** index).toString(),
            };
        }
    );

    const STATUS_ARRAY = () => {
        switch (statusType) {
            case "booking":
                return TASK_STATUS_ARRAY;
            case "transaction":
                return TRANSACTION_STATUS_ARRAY;
            case "redeem":
                return REDEEM_STATUS_ARRAY;
            default:
                return TASK_STATUS_ARRAY;
        }
    };

    return (
        <Flex
            justify={"flex-start"}
            align={"center"}
            wrap={"wrap"}
            gap={"sm"}
            w={"100%"}
            className={classes.root}
        >

            {search && (
                <>
                    <Input
                        icon={<IconSearch size={18}/>}
                        placeholder="Search..."
                        className={classes.input}
                        radius={brandData.radius }
                        defaultValue={query.search}
                        onChange={debounce(
                            (e) => dispatch(setSearch(e.target.value)),
                            500
                        )}
                        miw={smallScreen ? 230 : 200}
                        w={"15%"}
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
                </>
            )}
            {showFilters && !is_product && services && !is_hotel && (
                <Select
                    placeholder={"Service Type"}
                    clearable
                    className={cx(classes.input, {
                        [classes.active]: service,
                    })}
                    searchable
                    miw={150}
                    rightSection={service ? "" : <IconChevronDown size={18}/>}
                    rightSectionWidth={30}
                    onClick={() => setFetchService(true)}
                    radius={brandData.radius }
                    styles={{rightSection: {pointerEvents: "none"}}}
                    onChange={(value) =>
                        dispatch(setQuery({key: "service", value}))
                    }
                    w={"15%"}
                    data={serviceOptions}
                />
            )}
            {showFilters && !is_product && location && (
                <Select
                    placeholder={"City"}
                    clearable
                    searchable
                    rightSection={city ? "" : <IconChevronDown size={18}/>}
                    rightSectionWidth={30}
                    onSearchChange={debounce((value) => {
                        if (value && value.length >= 3) setSearchCity(value);
                        else setSearchCity("");
                    }, 300)}
                    radius={brandData.radius }
                    className={cx(classes.input, {
                        [classes.active]: city,
                    })}
                    onChange={(value) =>
                        dispatch(setQuery({key: "city", value}))
                    }
                    miw={150}
                    w={"10%"}
                    data={cityOptions}
                    nothingFound="No city found"
                />
            )}
            {showFilters && statusFilter && (
                <Select
                    placeholder={"Status"}
                    clearable
                    className={cx(classes.input, {
                        [classes.active]: status,
                    })}
                    miw={150}
                    rightSection={status ? "" : <IconChevronDown size={18}/>}
                    rightSectionWidth={30}
                    radius={brandData.radius }
                    styles={{rightSection: {pointerEvents: "none"}}}
                    onChange={(value) =>
                        dispatch(setQuery({key: "status", value}))
                    }
                    w={"10%"}
                    data={STATUS_ARRAY()}
                />
            )}
            {showFilters && paymentMethod && (
                <Select
                    placeholder={"Payment"}
                    clearable
                    className={cx(classes.input, {
                        [classes.active]: payment_method,
                    })}
                    onClick={() => setFetchPayment(true)}
                    rightSection={
                        payment_method ? "" : <IconChevronDown size={18}/>
                    }
                    rightSectionWidth={30}
                    radius={brandData.radius }
                    styles={{rightSection: {pointerEvents: "none"}}}
                    onChange={(value) =>
                        dispatch(setQuery({key: "payment_method", value}))
                    }
                    w={"10%"}
                    miw={120}
                    data={paymentOptions}
                />
            )}
            {showFilters && sortDate && !is_hotel && (
                <Box style={{position: "relative"}}>
                    <Button
                        radius={brandData.radius }
                        variant={date ? "filled" : "default"}
                        className={cx(classes.root, {
                            [classes.activeSort]: date,
                        })}
                        onClick={() =>
                            dispatch(
                                setQuery({
                                    key: "date",
                                    value: "&ordering=-created_at",
                                })
                            )
                        }
                    >
                        Sort Date{" "}
                        {date &&
                            (date === "&ordering=-created_at" ? (
                                <IconChevronUp size={16}/>
                            ) : (
                                <IconChevronDown size={16}/>
                            ))}
                    </Button>
                    {date && (
                        <ActionIcon
                            size={20}
                            variant={"transparent"}
                            className={classes.crossBtn}
                            onClick={() =>
                                dispatch(
                                    setQuery({
                                        key: "date",
                                        value: "",
                                    })
                                )
                            }
                        >
                            <IconX size={14}/>
                        </ActionIcon>
                    )}
                </Box>
            )}
            {showFilters && sortBudget && (
                <Box style={{position: "relative"}}>
                    <Button
                        radius={brandData.radius }
                        variant={budget ? "filled" : "default"}
                        className={cx(classes.root, {
                            [classes.activeSort]: budget,
                        })}
                        onClick={() =>
                            dispatch(
                                setQuery({
                                    key: "budget",
                                    value: "&ordering=-budget_to",
                                })
                            )
                        }
                    >
                        Sort Budget{" "}
                        {budget &&
                            (budget === "&ordering=-budget_to" ? (
                                <IconChevronDown size={16}/>
                            ) : (
                                <IconChevronUp size={16}/>
                            ))}
                    </Button>
                    {budget && (
                        <ActionIcon
                            size={20}
                            variant={"transparent"}
                            className={classes.crossBtn}
                            onClick={() =>
                                dispatch(
                                    setQuery({
                                        key: "budget",
                                        value: "",
                                    })
                                )
                            }
                        >
                            <IconX size={14}/>
                        </ActionIcon>
                    )}
                </Box>
            )}
            {showFilters && sortTasker && (
                <Box style={{position: "relative"}}>
                    <Button
                        radius={brandData.radius }
                        w={"100%"}
                        variant={top_tasker ? "filled" : "default"}
                        className={cx(classes.root, {
                            [classes.activeSort]: top_tasker,
                        })}
                        onClick={() =>
                            dispatch(
                                setQuery({
                                    key: "top_tasker",
                                    value: "&ordering=-top",
                                })
                            )
                        }
                    >
                        Sort Top Tasker{" "}
                        {top_tasker &&
                            (top_tasker === "&ordering=-top" ? (
                                <IconChevronUp size={16}/>
                            ) : (
                                <IconChevronDown size={16}/>
                            ))}
                    </Button>
                    {top_tasker && (
                        <ActionIcon
                            size={20}
                            variant={"transparent"}
                            className={classes.crossBtn}
                            onClick={() =>
                                dispatch(
                                    setQuery({
                                        key: "top_tasker",
                                        value: "",
                                    })
                                )
                            }
                        >
                            <IconX size={14}/>
                        </ActionIcon>
                    )}
                </Box>
            )}
            {showFilters && filterDate && (
                <Menu
                    withArrow
                    position="bottom"
                    transitionProps={{transition: "pop"}}
                    id="profile-menu"
                    opened={dateFilter}
                    onChange={setDateFilter}
                >
                    <Box style={{position: "relative"}}>
                        <Menu.Target>
                            <Button
                                radius={brandData.radius }
                                variant={
                                    date_after || date_before
                                        ? "filled"
                                        : "default"
                                }
                                className={cx(classes.root, {
                                    [classes.activeSort]:
                                    date_after || date_before,
                                })}
                                w={"100%"}
                            >
                                Filter Date
                            </Button>
                        </Menu.Target>
                        {(date_after || date_before) && (
                            <ActionIcon
                                size={20}
                                variant={"transparent"}
                                className={classes.crossBtn}
                                onClick={() => {
                                    dispatch(
                                        setQuery({
                                            key: "date_after",
                                            value: "",
                                        })
                                    );
                                    dispatch(
                                        setQuery({
                                            key: "date_before",
                                            value: "",
                                        })
                                    );
                                    setDateFilter(false);
                                }}
                            >
                                <IconX size={14}/>
                            </ActionIcon>
                        )}
                    </Box>
                    <Menu.Dropdown p={24}>
                        <Title
                            order={3}
                            size={20}
                            fw={500}
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.gray[3]
                                    : theme.colors.gray[8]
                            }
                        >
                            Filter
                        </Title>
                        <Formik
                            initialValues={{
                                date_after: date_after
                                    ? new Date(date_after)
                                    : "",
                                date_before: date_before
                                    ? new Date(date_before)
                                    : "",
                            }}
                            validationSchema={DateFilterSchema}
                            onSubmit={(value) => {
                                dispatch(
                                    setQuery({
                                        key: "date_after",
                                        value: value.date_after
                                            ? format(
                                                new Date(
                                                    String(value.date_after)
                                                ),
                                                "yyyy-MM-dd"
                                            )
                                            : "",
                                    })
                                );

                                dispatch(
                                    setQuery({
                                        key: "date_before",
                                        value: value.date_before
                                            ? format(
                                                new Date(
                                                    String(value.date_before)
                                                ),
                                                "yyyy-MM-dd"
                                            )
                                            : "",
                                    })
                                );

                                setDateFilter(false);
                            }}
                        >
                            {({errors, touched, setFieldValue, values}) => (
                                <Form>
                                    <Flex
                                        justify={"flex-start"}
                                        align={"flex-start"}
                                        direction={{
                                            base: "column",
                                            sm: "row",
                                        }}
                                        gap={{base: 0, sm: 12}}
                                        mt={20}
                                    >
                                        <DateField
                                            id="date_after"
                                            name="date_after"
                                            label="From"
                                            placeholder="MM/DD/YYYY"
                                            error={errors.date_after}
                                            touch={touched.date_after}
                                            rightSection={
                                                <>
                                                    {values.date_after && (
                                                        <ActionIcon
                                                            size={25}
                                                            variant={
                                                                "transparent"
                                                            }
                                                            className={
                                                                classes.crossBtn
                                                            }
                                                            onClick={() => {
                                                                setFieldValue(
                                                                    "date_after",
                                                                    ""
                                                                );
                                                            }}
                                                        >
                                                            <IconX
                                                                size={14}
                                                                color={
                                                                    theme.colors
                                                                        .gray[7]
                                                                }
                                                            />
                                                        </ActionIcon>
                                                    )}
                                                </>
                                            }
                                            icon={
                                                <IconCalendarEvent
                                                    size={20}
                                                    color={
                                                        theme.colors.brand[3]
                                                    }
                                                />
                                            }
                                            maxDate={new Date()}
                                            maw={180}
                                            onChange={(value) => {
                                                setFieldValue(
                                                    "date_after",
                                                    value
                                                );
                                            }}
                                        />
                                        <DateField
                                            id="date_before"
                                            name="date_before"
                                            label="To"
                                            placeholder="MM/DD/YYYY"
                                            error={errors.date_before}
                                            touch={touched.date_before}
                                            rightSection={
                                                <>
                                                    {values.date_before && (
                                                        <ActionIcon
                                                            size={25}
                                                            variant={
                                                                "transparent"
                                                            }
                                                            className={
                                                                classes.crossBtn
                                                            }
                                                            onClick={() => {
                                                                setFieldValue(
                                                                    "date_before",
                                                                    ""
                                                                );
                                                            }}
                                                        >
                                                            <IconX
                                                                size={14}
                                                                color={
                                                                    theme.colors
                                                                        .gray[7]
                                                                }
                                                            />
                                                        </ActionIcon>
                                                    )}
                                                </>
                                            }
                                            icon={
                                                <IconCalendarEvent
                                                    size={20}
                                                    color={
                                                        theme.colors.brand[3]
                                                    }
                                                />
                                            }
                                            maxDate={new Date()}
                                            maw={180}
                                            onChange={(value) => {
                                                setFieldValue(
                                                    "date_before",
                                                    value
                                                );
                                            }}
                                        />
                                    </Flex>
                                    <Flex justify={"center"} gap={12}>
                                        <Button
                                            variant="outline"
                                            onClick={() => setDateFilter(false)}
                                        >
                                            Cancel
                                        </Button>

                                        <FormButton
                                            name={"Apply"}
                                            id={"apply-btn"}
                                            type="submit"
                                        />
                                    </Flex>
                                </Form>
                            )}
                        </Formik>
                    </Menu.Dropdown>
                </Menu>
            )}
            {showFilters && filterBudget && (
                <Menu
                    withArrow
                    position="bottom"
                    transitionProps={{transition: "pop"}}
                    id="profile-menu"
                    opened={budgetFilter}
                    onChange={setBudgetFilter}
                >
                    <Box style={{position: "relative"}}>
                        <Menu.Target>
                            <Button
                                radius={brandData.radius }
                                variant={
                                    budget_to || budget_from
                                        ? "filled"
                                        : "default"
                                }
                                className={cx(classes.root, {
                                    [classes.activeSort]:
                                    budget_to || budget_from,
                                })}
                                w={"100%"}
                            >
                                Filter Amount
                            </Button>
                        </Menu.Target>
                        {(budget_to || budget_from) && (
                            <ActionIcon
                                size={20}
                                variant={"transparent"}
                                className={classes.crossBtn}
                                onClick={() => {
                                    dispatch(
                                        setQuery({
                                            key: "budget_from",
                                            value: "",
                                        })
                                    );
                                    dispatch(
                                        setQuery({
                                            key: "budget_to",
                                            value: "",
                                        })
                                    );
                                    setBudgetFilter(false);
                                }}
                            >
                                <IconX size={14}/>
                            </ActionIcon>
                        )}
                    </Box>
                    <Menu.Dropdown p={24}>
                        <Title
                            order={3}
                            size={20}
                            fw={500}
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.gray[3]
                                    : theme.colors.gray[8]
                            }
                        >
                            Filter Range
                        </Title>
                        <Formik
                            initialValues={{
                                from: budget_from
                                    ? parseInt(budget_from.split("=")[1])
                                    : MIN_AMOUNT,
                                to: budget_to
                                    ? parseInt(budget_to.split("=")[1])
                                    : MAX_AMOUNT,
                            }}
                            onSubmit={(value) => {
                                dispatch(
                                    setQuery({
                                        key: "budget_from",
                                        value: value.from.toString(),
                                        additional_keys: priceType,
                                    })
                                );

                                dispatch(
                                    setQuery({
                                        key: "budget_to",
                                        value: value.to.toString(),
                                        additional_keys: priceType,
                                    })
                                );

                                setBudgetFilter(false);
                            }}
                        >
                            {({errors, touched, setFieldValue, values}) => (
                                <Form>
                                    <Flex
                                        justify={"flex-start"}
                                        gap={4}
                                        align={"flex-end"}
                                    >
                                        <Text component="p">${MIN_AMOUNT}</Text>
                                        <RangeSlider
                                            thumbSize={14}
                                            marks={marks}
                                            label={() => (
                                                <Text component="span">
                                                    {""}
                                                </Text>
                                            )}
                                            sx={{
                                                ".mantine-Slider-label": {
                                                    background: "transparent",
                                                    top: 10,
                                                },
                                            }}
                                            w={"100%"}
                                            mt="xl"
                                            min={0}
                                            max={Math.log10(MAX_AMOUNT)}
                                            minRange={0.001}
                                            value={[
                                                Math.log10(values.from),
                                                Math.log10(values.to),
                                            ]}
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "from",
                                                    10 ** e[0]
                                                );
                                                setFieldValue("to", 10 ** e[1]);
                                            }}
                                        />
                                        <Text component="p">
                                            ${numberFormater.format(MAX_AMOUNT)}
                                        </Text>
                                    </Flex>
                                    <Flex
                                        justify={"flex-start"}
                                        align={"flex-start"}
                                        direction={{
                                            base: "column",
                                            sm: "row",
                                        }}
                                        gap={{base: 0, sm: 12}}
                                        mt={40}
                                    >
                                        <NumberField
                                            id="from"
                                            name={"from"}
                                            maw={220}
                                            placeholder="From"
                                            touch={touched.from}
                                            error={errors.from}
                                            minimum={MIN_AMOUNT}
                                            maximum={MAX_AMOUNT}
                                            withAsterisk
                                        />
                                        <NumberField
                                            id="to"
                                            name={"to"}
                                            maw={220}
                                            placeholder="To"
                                            touch={touched.to}
                                            error={errors.to}
                                            minimum={values.from}
                                            maximum={MAX_AMOUNT}
                                            withAsterisk
                                        />
                                    </Flex>
                                    <Flex justify={"center"} gap={12}>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setBudgetFilter(false)
                                            }
                                        >
                                            Cancel
                                        </Button>

                                        <FormButton
                                            name={"Apply"}
                                            id={"apply-btn"}
                                            type="submit"
                                        />
                                    </Flex>
                                </Form>
                            )}
                        </Formik>
                    </Menu.Dropdown>
                </Menu>
            )}
            {showFilters && category && !is_hotel && (
                <Box style={{position: "relative"}}>
                    <Button
                        radius={brandData.radius }
                        variant={query?.category ? "filled" : "default"}
                        className={cx(classes.root, {
                            [classes.activeSort]: query?.category,
                        })}
                        onClick={handleClick}
                        w={"100%"}
                    >
                        {query?.subCategoryName && query?.category_name
                            ? query?.subCategoryName
                            : query?.category_name ? query?.category_name : "Select Category"}{" "}
                        <IconExternalLink
                            size={16}
                            style={{margin: "0 10px 0 5px"}}
                        />
                    </Button>
                    {query?.category && (
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
                // <Select
                //     placeholder={"Category Type"}
                //     clearable
                //     className={cx(classes.input, {
                //         [classes.active]: category,
                //     })}
                //     searchable
                //     miw={150}
                //     rightSection={fetchCategory ? "" : <IconChevronDown size={18} />}
                //     rightSectionWidth={30}
                //     // onClick={() => setFetchCategory(fetchCategory)}
                //     radius={20}
                //     styles={{ rightSection: { pointerEvents: "none" } }}
                //     onChange={(value) => {
                //         setFetchCategory(value); // Update fetch category state
                //         dispatch(setQuery({ key: "category", value })); // Update Redux store
                //     }}
                //     onClick={() => {
                //         // Ensure `fetchCategory` is updated only when necessary
                //         if (!fetchCategory) setFetchCategory(null);
                //     }}
                //     w={"15%"}
                //     data={CategoryOptions}
                // />
            )}
            {showFilters && query?.options && (
                <Box style={{position: "relative"}}>
                    <Button
                        radius={brandData.radius }
                        variant={query?.options ? "filled" : "default"}
                        className={cx(classes.root, {
                            [classes.activeSort]: query?.options,
                        })}
                        onClick={() => router.push("/category")}
                        w={"100%"}
                    >
                        {query?.options}{" "}
                    </Button>
                    {query?.options && (
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
            )}
        </Flex>
    );
};
