import React from 'react';
import {Flex, Input, Select, useMantineTheme, Box} from '@mantine/core';
import { IconSearch} from '@tabler/icons-react';
import {useFilterStyles} from "@/styles/components/FilterStyles";
import { Menu, ActionIcon, Title, Button as MantineButton } from '@mantine/core';
import { IconCalendarEvent, IconX } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';

interface FilterComponentProps {
    searchStaff: string;
    setSearchStaff: (value: string) => void;
    createdAtFilter: string;
    setCreatedAtFilter: (value: string) => void;
    activeFilter: string | null;
    setActiveFilter: (value: string | null) => void;
    jobTypeFilter: string | null;
    setJobTypeFilter: (value: string | null) => void;
    roleFilter: string | null;
    setRoleFilter: (value: string | null) => void;
    dateAfter: string;
    setDateAfter: (value: string) => void;
    dateBefore: string;
    setDateBefore: (value: string) => void;
    dateFilterOpen: boolean;
    setDateFilterOpen: (value: boolean) => void;
    filterOptions: {
        roles: { id: string | number; name: string }[];
        job_types: { key: string; label: string }[];
        request_status: { key: string; label: string }[];
    };
}

const FilterComponent: React.FC<FilterComponentProps> = ({
                                                             searchStaff,
                                                             setSearchStaff,
                                                             createdAtFilter,
                                                             setCreatedAtFilter,
                                                             activeFilter,
                                                             setActiveFilter,
                                                             jobTypeFilter,
                                                             setJobTypeFilter,
                                                             roleFilter,
                                                             setRoleFilter,
                                                             filterOptions,
                                                             dateAfter,
                                                             setDateAfter,
                                                             dateBefore,
                                                             setDateBefore,
                                                             dateFilterOpen,
                                                             setDateFilterOpen,
                                                         }) => {
    const { cx, classes } = useFilterStyles();
    const theme = useMantineTheme();
    const form = useForm({
        initialValues: {
            date_after: dateAfter ? new Date(dateAfter) : null,
            date_before: dateBefore ? new Date(dateBefore) : null,
        },
    });

    const handleDateSubmit = (values: { date_after: Date | null; date_before: Date | null }) => {
        setDateAfter(values.date_after ? values.date_after.toISOString().split('T')[0] : '');
        setDateBefore(values.date_before ? values.date_before.toISOString().split('T')[0] : '');
        setDateFilterOpen(false);
    };
    return (
        <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="flex-start"
            align={{ base: 'stretch', md: 'center' }}
            wrap="wrap"
            gap="sm"
            className={classes.root}
        >
            {/* Search bar */}
            <Input
                icon={<IconSearch size={18} />}
                placeholder="Search staffs..."
                className={classes.input}
                radius={20}
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                miw={200}
                w={"15%"}
            />

            {/* Updated Date Filter */}
            <Menu
                withArrow
                position="bottom"
                transitionProps={{ transition: "pop" }}
                opened={dateFilterOpen}
                onChange={setDateFilterOpen}
            >
                <Box style={{ position: "relative" }}>
                    <Menu.Target>
                        <MantineButton
                            radius={20}
                            variant={dateAfter || dateBefore ? "filled" : "default"}
                            className={cx(classes.root, {
                                [classes.activeSort]: dateAfter || dateBefore,
                            })}
                            w={"10%"}
                            miw={150}
                        >
                            Filter Date
                        </MantineButton>
                    </Menu.Target>
                    {(dateAfter || dateBefore) && (
                        <ActionIcon
                            size={20}
                            variant="transparent"
                            className={classes.crossBtn}
                            onClick={() => {
                                setDateAfter('');
                                setDateBefore('');
                                form.setValues({ date_after: null, date_before: null });
                                setDateFilterOpen(false);
                            }}
                        >
                            <IconX size={14} />
                        </ActionIcon>
                    )}
                </Box>
                <Menu.Dropdown p={24}>
                    <Title
                        order={3}
                        size={20}
                        fw={500}
                        color={theme.colorScheme === "dark" ? theme.colors.gray[3] : theme.colors.gray[8]}
                    >
                        Filter Date
                    </Title>
                    <form onSubmit={form.onSubmit(handleDateSubmit)}>
                        <Flex
                            justify="flex-start"
                            align="flex-start"
                            direction={{ base: "column", sm: "row" }}
                            gap={{ base: 12, sm: 12 }}
                            mt={20}
                        >
                            <DatePickerInput
                                id="date_after"
                                name="date_after"
                                label="From"
                                placeholder="MM/DD/YYYY"
                                value={form.values.date_after}
                                onChange={(value) => form.setFieldValue('date_after', value)}
                                rightSection={
                                    form.values.date_after && (
                                        <ActionIcon
                                            size={25}
                                            variant="transparent"
                                            onClick={() => form.setFieldValue('date_after', null)}
                                        >
                                            <IconX size={14} color={theme.colors.gray[7]} />
                                        </ActionIcon>
                                    )
                                }
                                icon={<IconCalendarEvent size={20} color={theme.colors.orange[3]} />}
                                maxDate={new Date()}
                                maw={180}
                            />
                            <DatePickerInput
                                id="date_before"
                                name="date_before"
                                label="To"
                                placeholder="MM/DD/YYYY"
                                value={form.values.date_before}
                                onChange={(value) => form.setFieldValue('date_before', value)}
                                rightSection={
                                    form.values.date_before && (
                                        <ActionIcon
                                            size={25}
                                            variant="transparent"
                                            onClick={() => form.setFieldValue('date_before', null)}
                                        >
                                            <IconX size={14} color={theme.colors.gray[7]} />
                                        </ActionIcon>
                                    )
                                }
                                icon={<IconCalendarEvent size={20} color={theme.colors.orange[3]} />}
                                maxDate={new Date()}
                                maw={180}
                            />
                        </Flex>
                        <Flex justify="center" gap={12} mt={20}>
                            <MantineButton variant="outline" onClick={() => setDateFilterOpen(false)}>
                                Cancel
                            </MantineButton>
                            <MantineButton type="submit" color="orange">
                                Apply
                            </MantineButton>
                        </Flex>
                    </form>
                </Menu.Dropdown>
            </Menu>

            {/* Active */}
            <Select
                placeholder=" status"
                data={[
                    { value: 'true', label: 'Available' },
                    { value: 'false', label: 'Unavailable' }
                ]}
                value={activeFilter}
                onChange={setActiveFilter}
                className={classes.input}
                radius={20}
                clearable
                miw={150}
                w={"10%"}
            />

            {/* job Type */}
            <Select
                placeholder=" job type"
                data={filterOptions.job_types.map((job) => ({ value: job.key, label: job.label }))}
                value={jobTypeFilter}
                onChange={setJobTypeFilter}
                className={classes.input}
                radius={20}
                clearable
                miw={150}
                w={"10%"}
            />

            {/* Role */}
            <Select
                placeholder="role"
                data={filterOptions.roles.map((role) => ({ value: role.id.toString(), label: role.name }))}
                value={roleFilter}
                onChange={setRoleFilter}
                className={classes.input}
                radius={20}
                clearable
                miw={150}
                w={"10%"}
            />

            {/* KYC Verified */}
            <Select
                placeholder="Kyc "
                data={[
                    { value: 'true', label: 'Verified' },
                    { value: 'false', label: 'Not verified' }
                ]}
                value={activeFilter}
                onChange={setActiveFilter}
                className={classes.input}
                radius={20}
                clearable
                miw={150}
                w={"10%"}
            />
        </Flex>
    );
};

export default FilterComponent;
