import React, {useState, useMemo} from 'react';
import {Edit2, Trash2, FileText} from 'lucide-react';
import {
    Table,
    Box,
    Flex,
    Pagination,
    Select,
    Tooltip,
    ActionIcon,
    Text,
    ScrollArea,
    Input, Button, Menu, Title,
} from '@mantine/core';
import {CSVLink} from 'react-csv';
import {
    IconArrowNarrowDown,
    IconArrowNarrowUp,
    IconSwitchVertical,
    IconX,
    IconSearch, IconCalendarEvent
} from "@tabler/icons-react";
import {useForm} from '@mantine/form';
import {DatePickerInput} from '@mantine/dates';
import {SkeletonTableList} from "@/components/skeletons/SkeletonTableList";
import {useFilterStyles} from "@/styles/components/FilterStyles";

const StaffListView = ({
                           loading,
                           filteredStaffMembers: initialStaffMembers,
                           activeTab,
                           dark,
                           theme,
                           handleEdit,
                           openDeleteConfirmModal,
                           getStatusColor,
                           sortByName,
                           sortByJoinDate,
                           showWaitBanner,
                           clocks,
                           clockIndex,
                           dots,
                           totalPages = 5,
                           page,
                           setPage,
                           pageSize = "10",
                           setPageSize,
                           filterOptions,
                           searchStaff,
                           activeFilter,
                           jobTypeFilter,
                           roleFilter,
                           setSearchStaff,
                           setActiveFilter,
                           setJobTypeFilter,
                           setRoleFilter,
                           dateAfter,
                           setDateAfter,
                           dateBefore,
                           setDateBefore,
                       }: any) => {
    const [nameSortState, setNameSortState] = useState('neutral');
    const [joinDateSortState, setJoinDateSortState] = useState('neutral');
    const [dateFilterOpen, setDateFilterOpen] = useState(false);
    const {classes, cx} = useFilterStyles();
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

    const filteredStaffMembers = useMemo(() => {
        let result = [...initialStaffMembers];

        if (searchStaff) {
            result = result.filter(member =>
                member.user?.full_name?.toLowerCase().includes(searchStaff.toLowerCase()) ||
                member.user?.email?.toLowerCase().includes(searchStaff.toLowerCase())
            );
        }
        if (activeFilter) {
            const isActive = activeFilter === 'true';
            result = result.filter(member =>
                String(member.is_active) === String(isActive)
            );
        }
        if (jobTypeFilter) {
            result = result.filter(member =>
                member.job_type?.toLowerCase() === jobTypeFilter.toLowerCase()
            );
        }
        if (roleFilter) {
            result = result.filter(member =>
                member.roles?.some((role: string) =>
                    role.toString().toLowerCase() === roleFilter.toLowerCase() ||
                    filterOptions?.roles.find((r: {
                        id: { toString: () => any; };
                    }) => r.id.toString() === roleFilter)?.name.toLowerCase() === role.toLowerCase()
                )
            );
        }
        return result;
    }, [initialStaffMembers, searchStaff, activeFilter, jobTypeFilter, roleFilter, filterOptions]);

    const handleNameSort = () => {
        if (nameSortState === 'neutral') {
            setNameSortState('asc');
            sortByName(true);
        } else if (nameSortState === 'asc') {
            setNameSortState('desc');
            sortByName(false);
        } else {
            setNameSortState('neutral');
        }
    };

    const handleJoinDateSort = () => {
        if (joinDateSortState === 'neutral') {
            setJoinDateSortState('asc');
            sortByJoinDate(true);
        } else if (joinDateSortState === 'asc') {
            setJoinDateSortState('desc');
            sortByJoinDate(false);
        } else {
            setJoinDateSortState('neutral');
        }
    };

    const resetNameSort = (e: { stopPropagation: () => void; }) => {
        e.stopPropagation();
        setNameSortState('neutral');
    };

    const resetJoinDateSort = (e: { stopPropagation: () => void; }) => {
        e.stopPropagation();
        setJoinDateSortState('neutral');
    };

    const resetAllFilters = () => {
        setSearchStaff('');
        setActiveFilter(null);
        setJobTypeFilter(null);
        setRoleFilter(null);
        setDateAfter('');
        setDateBefore('');
        setNameSortState('neutral');
        setJoinDateSortState('neutral');
        form.setValues({date_after: null, date_before: null});
    };

    const csvData = filteredStaffMembers?.map((member: {
        user: { full_name: any; email: any; };
        created_by: { full_name: any; };
        job_type: any;
        roles: any[];
        created_at: string | number | Date;
        request_status: any;
        is_active: string | boolean;
    }) => ({
        Name: member.user?.full_name,
        CreatedBy: member.created_by?.full_name,
        JobType: member.job_type,
        Roles: member.roles?.join(', '),
        JoinedDate: new Date(member.created_at).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        Email: member.user?.email,
        VerificationRequest: member.request_status,
        Status: member.is_active === true || member.is_active === "true" ? "Available" : "Unavailable",
    }));

    if (loading) {
        return (
            <Box
                sx={{
                    background: dark ? theme.colors.dark[8] : "",
                    border: dark ? `1px solid ${theme.colors.dark[7]}` : `1px solid rgba(0, 0, 0, 0.08)`,
                    borderRadius: 4,
                    padding: 16,
                }}
            >
                <SkeletonTableList/>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                background: dark ? theme.colors.dark[8] : "",
                border: dark ? `1px solid ${theme.colors.dark[7]}` : `1px solid rgba(0, 0, 0, 0.08)`,
                borderRadius: 4,
                padding: 16,
            }}
        >
            <Flex
                mb={16}
                justify="space-between"
                gap={10}
                align={{base: "flex-start", sm: "center"}}
                direction={{base: "column", sm: "row"}}
            >
                <Flex>
                    {(initialStaffMembers.length > 0 || searchStaff || activeFilter || jobTypeFilter || roleFilter) && (
                        <Flex mb={16} gap={3} wrap="wrap" align="center">
                            <Input
                                icon={<IconSearch size={18}/>}
                                placeholder="Search staffs..."
                                radius={20}
                                value={searchStaff}
                                onChange={(e) => setSearchStaff(e.target.value)}
                                miw={200}
                            />
                            <Menu withArrow position="bottom" transitionProps={{transition: "pop"}}
                                  opened={dateFilterOpen} onChange={setDateFilterOpen}>
                                <Box style={{position: "relative"}}>
                                    <Menu.Target>
                                        <Button
                                            radius={20}
                                            variant={dateAfter || dateBefore ? "filled" : "default"}
                                            className={cx(classes.root, {[classes.activeSort]: dateAfter || dateBefore})}
                                            miw={150}
                                        >
                                            Filter Date
                                        </Button>
                                    </Menu.Target>
                                    {(dateAfter || dateBefore) && (
                                        <ActionIcon
                                            size={20}
                                            variant="transparent"
                                            className={classes.crossBtn}
                                            onClick={() => {
                                                setDateAfter('');
                                                setDateBefore('');
                                                form.setValues({date_after: null, date_before: null});
                                                setDateFilterOpen(false);
                                            }}
                                        >
                                            <IconX size={14}/>
                                        </ActionIcon>
                                    )}
                                </Box>
                                <Menu.Dropdown p={24}>
                                    <Title order={3} size={20} fw={500}
                                           color={theme.colorScheme === "dark" ? theme.colors.gray[3] : theme.colors.gray[8]}>
                                        Filter Date
                                    </Title>
                                    <form onSubmit={form.onSubmit(handleDateSubmit)}>
                                        <Flex justify="flex-start" align="flex-start"
                                              direction={{base: "column", sm: "row"}} gap={{base: 12, sm: 12}} mt={20}>
                                            <DatePickerInput
                                                id="date_after"
                                                name="date_after"
                                                label="From"
                                                placeholder="MM/DD/YYYY"
                                                value={form.values.date_after}
                                                onChange={(value: any) => form.setFieldValue('date_after', value)}
                                                rightSection={
                                                    form.values.date_after && (
                                                        <ActionIcon size={25} variant="transparent"
                                                                    onClick={() => form.setFieldValue('date_after', null)}>
                                                            <IconX size={14} color={theme.colors.gray[7]}/>
                                                        </ActionIcon>
                                                    )
                                                }
                                                icon={<IconCalendarEvent size={20} color={theme.colors.orange[3]}/>}
                                                maxDate={new Date()}
                                                maw={180}
                                            />
                                            <DatePickerInput
                                                id="date_before"
                                                name="date_before"
                                                label="To"
                                                placeholder="MM/DD/YYYY"
                                                value={form.values.date_before}
                                                onChange={(value: any) => form.setFieldValue('date_before', value)}
                                                rightSection={
                                                    form.values.date_before && (
                                                        <ActionIcon size={25} variant="transparent"
                                                                    onClick={() => form.setFieldValue('date_before', null)}>
                                                            <IconX size={14} color={theme.colors.gray[7]}/>
                                                        </ActionIcon>
                                                    )
                                                }
                                                icon={<IconCalendarEvent size={20} color={theme.colors.orange[3]}/>}
                                                maxDate={new Date()}
                                                maw={180}
                                            />
                                        </Flex>
                                        <Flex justify="center" gap={12} mt={20}>
                                            <Button variant="outline" onClick={() => setDateFilterOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" color="orange">
                                                Apply
                                            </Button>
                                        </Flex>
                                    </form>
                                </Menu.Dropdown>
                            </Menu>
                            <Select
                                placeholder="Job Type"
                                data={filterOptions?.job_types?.map((job: { key: any; label: any; }) => ({
                                    value: job.key,
                                    label: job.label
                                })) || []}
                                value={jobTypeFilter}
                                onChange={setJobTypeFilter}
                                radius={20}
                                clearable
                                miw={150}
                            />
                            <Select
                                placeholder="Role"
                                data={filterOptions?.roles?.map((role: {
                                    id: { toString: () => any; };
                                    name: any;
                                }) => ({
                                    value: role.id.toString(),
                                    label: role.name
                                })) || []}
                                value={roleFilter}
                                onChange={setRoleFilter}
                                radius={20}
                                clearable
                                miw={150}
                            />
                            <Select
                                placeholder="Status"
                                data={[
                                    {value: 'true', label: 'Available'},
                                    {value: 'false', label: 'Unavailable'}
                                ]}
                                value={activeFilter}
                                onChange={setActiveFilter}
                                radius={20}
                                clearable
                                miw={150}
                            />
                        </Flex>
                    )}
                </Flex>

                <Flex justify="flex-end" gap={10}>
                    {(searchStaff || activeFilter || jobTypeFilter || roleFilter || nameSortState !== 'neutral' || joinDateSortState !== 'neutral') && (
                        <Tooltip
                            label="Reset All Filters"
                            position="bottom"
                            styles={{
                                tooltip: {
                                    fontSize: 12,
                                    padding: "3px 8px",
                                    fontWeight: 500,
                                },
                            }}
                        >
                            <Button
                                radius={20}
                                variant={"filled"}
                                color={"red.5"}
                                onClick={resetAllFilters}
                                sx={{
                                    "& span": {
                                        color: "white",
                                        fontFamily: "Inter",
                                        fontWeight: 500,
                                        fontSize: 12,
                                    },
                                }}
                            >
                                reset
                                <IconX size={14} style={{marginLeft: 5}}/>
                            </Button>
                        </Tooltip>
                    )}

                    {filteredStaffMembers && filteredStaffMembers.length > 0 && (
                        <CSVLink
                            data={csvData || ""}
                            filename="staff_list.csv"
                            target="_blank"
                        >
                            <Tooltip
                                label="Export CSV"
                                position="bottom"
                                styles={{
                                    tooltip: {
                                        fontSize: 12,
                                        padding: "3px 8px",
                                        fontWeight: 500,
                                    },
                                }}
                            >
                                <ActionIcon
                                    variant="light"
                                    radius="xl"
                                    size={40}
                                    color="gray.5"
                                    sx={{
                                        cursor: "pointer",
                                    }}
                                >
                                    <FileText size={22}/>
                                </ActionIcon>
                            </Tooltip>
                        </CSVLink>
                    )}
                </Flex>
            </Flex>

            <ScrollArea>
                {filteredStaffMembers && filteredStaffMembers.length > 0 ? (
                    <Table highlightOnHover>
                        <thead>
                        <tr>
                            <th className="px-1 py-2">
                                <Flex align="center" gap={4} sx={{margin: 0, padding: 0}}>
                                    <Text>Name</Text>
                                    <div style={{position: 'relative', display: 'inline-block', marginLeft: 4}}>
                                        <ActionIcon
                                            onClick={handleNameSort}
                                            sx={{
                                                backgroundColor: nameSortState !== 'neutral' ? '#1E88E5' : 'transparent',
                                                color: nameSortState !== 'neutral' ? 'white' : 'inherit',
                                                '&:hover': {
                                                    opacity: 1,
                                                    backgroundColor: nameSortState !== 'neutral' ? '#1976D2' : '',
                                                },
                                                width: 16,
                                                height: 16,
                                            }}
                                            size="sm"
                                        >
                                            {nameSortState === 'neutral' &&
                                                <IconSwitchVertical color={"gray"} size={18}/>}
                                            {nameSortState === 'asc' && <IconArrowNarrowUp size={18}/>}
                                            {nameSortState === 'desc' && <IconArrowNarrowDown size={18}/>}
                                        </ActionIcon>
                                        {nameSortState !== 'neutral' && (
                                            <ActionIcon
                                                size="xs"
                                                radius="xl"
                                                sx={{
                                                    position: 'absolute',
                                                    top: -6,
                                                    right: -8,
                                                    zIndex: 1,
                                                    background: "red",
                                                    '&:hover': {
                                                        opacity: 1,
                                                        backgroundColor: '#FF6B6B',
                                                    },
                                                    width: 12,
                                                    height: 12,
                                                }}
                                                onClick={resetNameSort}
                                            >
                                                <IconX color={"white"} size={12}/>
                                            </ActionIcon>
                                        )}
                                    </div>
                                </Flex>
                            </th>
                            <th>
                                <Flex justify="start">
                                    <Text ml={6}>Created By</Text>
                                </Flex>
                            </th>
                            <th>
                                <Flex justify="start">
                                    <Text ml={6}>Job Type</Text>
                                </Flex>
                            </th>
                            <th>
                                <Flex justify="start">
                                    <Text ml={6}>Role</Text>
                                </Flex>
                            </th>
                            <th className="px-1 py-2">
                                <Flex align="center" gap={4} sx={{margin: 0, padding: 0}}>
                                    <Text>Joined Date</Text>
                                    <div style={{position: 'relative', display: 'inline-block', marginLeft: 4}}>
                                        <ActionIcon
                                            onClick={handleJoinDateSort}
                                            sx={{
                                                backgroundColor: joinDateSortState !== 'neutral' ? '#1E88E5' : 'transparent',
                                                color: joinDateSortState !== 'neutral' ? 'white' : 'inherit',
                                                '&:hover': {
                                                    opacity: 1,
                                                    backgroundColor: joinDateSortState !== 'neutral' ? '#1976D2' : '#f0f0f0',
                                                },
                                                width: 16,
                                                height: 16,
                                            }}
                                            size="sm"
                                        >
                                            {joinDateSortState === 'neutral' &&
                                                <IconSwitchVertical color={"gray"} size={18}/>}
                                            {joinDateSortState === 'asc' && <IconArrowNarrowUp size={18}/>}
                                            {joinDateSortState === 'desc' && <IconArrowNarrowDown size={18}/>}
                                        </ActionIcon>
                                        {joinDateSortState !== 'neutral' && (
                                            <ActionIcon
                                                size="xs"
                                                radius="xl"
                                                sx={{
                                                    position: 'absolute',
                                                    top: -6,
                                                    right: -8,
                                                    zIndex: 1,
                                                    background: "red",
                                                    '&:hover': {
                                                        opacity: 1,
                                                        backgroundColor: '#FF6B6B',
                                                    },
                                                    width: 12,
                                                    height: 12,
                                                }}
                                                onClick={resetJoinDateSort}
                                            >
                                                <IconX color={"white"} size={12}/>
                                            </ActionIcon>
                                        )}
                                    </div>
                                </Flex>
                            </th>
                            <th>
                                <Flex justify="start">
                                    <Text ml={6}>Email</Text>
                                </Flex>
                            </th>
                            <th>
                                <Flex justify="start">
                                    <Text ml={6}>Verification</Text>
                                </Flex>
                            </th>
                            <th>
                                <Flex justify="start">
                                    <Text ml={6}>Status</Text>
                                </Flex>
                            </th>
                            <th>
                                <Flex justify="start">
                                    <Text ml={6}>Actions</Text>
                                </Flex>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredStaffMembers?.map((member: {
                            staff_name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined;
                            staff_email: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined;
                            id: React.Key | null | undefined;
                            profile_image: any;
                            user: {
                                full_name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined;
                                email: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined;
                            };
                            created_by: {
                                full_name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined;
                            };
                            job_type: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined;
                            roles: (string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined)[];
                            created_at: string | number | Date;
                            request_status: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined;
                            is_active: string | boolean;
                        }) => (
                            <tr key={member.id}>
                                <td>
                                    <div className="flex items-center">
                                        <img
                                            className="h-10 w-10 rounded-full"
                                            src={member.profile_image || "/images/placeholder/personPlaceholder.jpg"}
                                            alt="Profile"
                                        />
                                        <div className="ml-4">
                                            <Text style={{color: dark ? "white" : ""}} weight={500}>
                                                {member.staff_name}
                                            </Text>
                                        </div>
                                    </div>
                                </td>
                                <td>{member.created_by?.full_name}</td>
                                <td>{member.job_type}</td>
                                <td>
                                    <div>
                                        {member.roles && Array.isArray(member.roles) && member.roles.length > 0 ? (
                                            member.roles.map((role: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined, index: React.Key | null | undefined) => (
                                                <div
                                                    className="bg-gray-200 p-1 rounded mb-1"
                                                    key={index}
                                                >
                                                    <span>{role}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-gray-200 p-1 rounded mb-1">
                                                <span>none assigned</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    {member.created_at
                                        ? new Date(member.created_at).toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                        : "No date available"}
                                </td>
                                <td>{member.staff_email}</td>
                                <td>{member.request_status}</td>
                                <td>
                                    <Text
                                        component="p"
                                        sx={{
                                            textAlign: "center",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: 6,
                                            textTransform: "capitalize",
                                        }}
                                        maw={120}
                                        p="6px 24px"
                                        className={getStatusColor(member.is_active)}
                                    >
                                        {member.is_active === true || member.is_active === "true"
                                            ? "Available"
                                            : "Unavailable"}
                                    </Text>
                                </td>
                                <td>
                                    <Flex gap={4} justify="flex-start" align="center">
                                        {activeTab !== "bin" && (
                                            <Tooltip label="Edit" position="bottom">
                                                <ActionIcon
                                                    variant="light"
                                                    color="green"
                                                    onClick={() => handleEdit(member)}
                                                    sx={{
                                                        '&:hover': {
                                                            opacity: 1,
                                                            backgroundColor: '#c8e6c9',
                                                        }
                                                    }}
                                                >
                                                    <Edit2 size={16}/>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        <Tooltip
                                            label={activeTab === "bin" ? "Delete Permanently" : "Move to Bin"}
                                            position="bottom"
                                        >
                                            <ActionIcon
                                                variant="light"
                                                color="red"
                                                onClick={() => openDeleteConfirmModal(member, activeTab === "bin")}
                                                sx={{
                                                    '&:hover': {
                                                        opacity: 1,
                                                        backgroundColor: '#ffcdd2',
                                                    }
                                                }}
                                            >
                                                <Trash2 size={16}/>
                                            </ActionIcon>
                                        </Tooltip>
                                    </Flex>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                ) : (
                    <Box p={20} sx={{textAlign: "center"}}>
                        <Text size="lg" weight={500} color="dimmed">
                            No Staff Members Found
                        </Text>
                        <Text size="sm" color="dimmed" mt={8}>
                            There are no staff members to display.
                        </Text>
                    </Box>
                )}
            </ScrollArea>

            {showWaitBanner && (
                <div
                    className="flex justify-center items-center bg-green-400 text-white p-4 mt-5 rounded-lg shadow-md w-full">
                    <div className="flex items-center">
                        <div className="mr-2 text-yellow-300">{clocks[clockIndex]}</div>
                        <div className="flex font-medium">
                            Please wait patiently until the staff accepts your invitation
                            <div className="ml-1 text-yellow-300">{dots}</div>
                        </div>
                    </div>
                </div>
            )}

            {totalPages > 0 && (
                <Flex mt={16} justify="space-between" align="center">
                    <Select
                        data={["10", "20", "30", "40"]}
                        placeholder="10"
                        value={pageSize}
                        onChange={(value) => value && setPageSize(value)}
                        style={{width: 80}}
                    />
                    <Pagination
                        total={totalPages}
                        color="orange"
                        size="md"
                        value={page}
                        onChange={setPage}
                    />
                </Flex>
            )}
        </Box>
    );
};

export default StaffListView;
