import React, {useEffect, useState} from 'react';
import {Search, Grid2X2, List} from 'lucide-react';
import {
    Clock1,
    Clock2,
    Clock3,
    Clock4,
    Clock5,
    Clock6,
    Clock7,
    Clock8,
    Clock9,
    Clock10,
    Clock11,
    Clock12
} from 'lucide-react';
import {Button, Modal, Flex, Select, Skeleton, Pagination, Tabs} from '@mantine/core';
import Layout from "@/components/Layout/Layout";
import {Menu, ActionIcon, Title, Button as MantineButton} from '@mantine/core';
import {IconCalendarEvent, IconX} from '@tabler/icons-react';
import {DatePickerInput} from '@mantine/dates';
import {useForm} from '@mantine/form';
import {useRouter} from "next/router";
import {useMantineTheme} from "@mantine/core";
import {useDark} from "@/utils/helpers";
import {MdVerified} from "react-icons/md";
import urls from "@/constants/urls";
import {axiosClient} from "@/utils/axiosClient";
import {useProfile} from "@/hooks/useProfile";
import {notifications} from "@mantine/notifications";
import {useFilterStyles} from "@/styles/components/FilterStyles";
import FilterComponent from "@/components/staff-list/FilterComponent";
import {modals} from '@mantine/modals';
import StaffListView from '@/components/StaffListView';

interface Member {
    id: string;
    first_name: string;
    last_name: string;
    roles: string[];
    type: string;
    position: string;
    is_active: string | boolean;
    profile_img: string | null;
    is_verified: boolean;
    is_profile_verified: boolean;
    createdBy: string;
    userType: string;
    joinedDate: string;
    email: string;
    permissions: string;
}

interface StaffMember {
    id: string;
    created_by: {
        full_name: string;
        email: string;
        id: string;
        phone: string;
    };
    user: {
        full_name: string;
        email: string;
        id: string;
        phone: string;
    };
    job_type: string;
    is_active: string | boolean;
    is_maintainer: string;
    is_tasker: string;
    created_at: string | number | null;
    profile_image: string;
    position: string;
    roles: string[];
    kyc_verified: boolean;
    request_status: string | boolean;
    "staff_name": string
    "staff_email": string
}

interface JobType {
    key: string;
    label: string;
}

interface Role {
    id: string | number;
    name: string;
}

interface RequestStatus {
    key: string;
    label: string;
}

const StaffList: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const theme = useMantineTheme();
    const dark = useDark();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>([]);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [createdAtFilter, setCreatedAtFilter] = useState<string>('');
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [selectedMemberInModal, setSelectedMemberInModal] = useState<Member | null>(null);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const [searchStaff, setSearchStaff] = useState('');
    const [searchMember, setSearchMember] = useState('');
    const {classes} = useFilterStyles();
    const [clockIndex, setClockIndex] = useState(0);
    const [dots, setDots] = useState('.');
    const [showWaitBanner, setShowWaitBanner] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
    const [jobTypeFilter, setJobTypeFilter] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState(0);
    const staffsPerPage = 10;
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<string | null>("active");
    const totalPages = Math.ceil(totalItems / staffsPerPage);
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [requestStatusFilter, setRequestStatusFilter] = useState<string | null>(null);
    const [dateFilterOpen, setDateFilterOpen] = useState(false);
    const [dateAfter, setDateAfter] = useState<string>('');
    const [dateBefore, setDateBefore] = useState<string>('');
    const [ordering, setOrdering] = useState<string | null>(null);
    const [filterOptions, setFilterOptions] = useState<{
        roles: Role[];
        job_types: JobType[];
        request_status: RequestStatus[];
    }>({
        roles: [],
        job_types: [],
        request_status: []
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [formData, setFormData] = useState({
        staff_name: '',
        staff_email: '',
        job_type: '',
        roles: [] as number[]
    });
    const {data: profileData} = useProfile();
    const merchantId = profileData?.user.id
    const toggleViewMode = () => {
        setViewMode(viewMode === 'list' ? 'grid' : 'list');
    };

    console.log('staff', staffMembers)
    console.log('staff selected', selectedStaff)
    console.log('staff edit', editingStaff)

    const handleEdit = (member: StaffMember) => {
        setEditingStaff(member);
        setFormData({
            staff_name: member.user?.full_name || '',
            staff_email: member.user?.email || '',
            job_type: member.job_type || '',
            roles: Array.isArray(member.roles)
                ? member.roles.map(role => {
                    const foundRole = filterOptions.roles.find(r => r.name === role);
                    return foundRole ? Number(foundRole.id) : 0;
                }).filter(id => id !== 0)
                : []
        });
        setIsEditModalOpen(true);
    };
    const handleUpdateStaff = async () => {
        if (!editingStaff) return;
        try {
            const response = await axiosClient.put(
                `${urls.members.postStaff}${editingStaff.id}/`,
                {
                    roles: formData.roles,
                    job_type: formData.job_type,
                    staff_name: formData.staff_name,
                    staff_email: formData.staff_email
                }
            );
            const updatedStaffMembers = staffMembers.map(staff =>
                staff.id === editingStaff.id
                    ? {
                        ...staff,
                        user: {
                            ...staff.user,
                            full_name: formData.staff_name,
                            email: formData.staff_email
                        },
                        job_type: formData.job_type,
                        roles: formData.roles.map(roleId => {
                            const role = filterOptions.roles.find(r => Number(r.id) === roleId);
                            return role ? role.name : '';
                        }).filter(name => name !== '')
                    }
                    : staff
            );
            setStaffMembers(updatedStaffMembers);
            setIsEditModalOpen(false);
            notifications.show({
                title: 'Success',
                message: 'Staff has been updated successfully.',
                color: 'green',
                autoClose: 3000,
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to update staff. Please try again.',
                color: 'red',
                autoClose: 3000,
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        }
    };
    const handleDelete = async (member: StaffMember) => {
        if (!hasPermission) {
            notifications.show({
                title: 'Permission Denied',
                message: 'You do not have permission to delete members.',
                color: 'orange',
                autoClose: 3000,
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
            return;
        }
        setSelectedMember(member);
        setActiveDropdown(null);
        const success = await deleteStaffMember([member.id]);
        if (success) {
            setStaffMembers(staffMembers.filter(staff => staff.id !== member.id));
            notifications.show({
                title: 'Successfully deleted',
                message: 'The staff has been sent to the bin.',
                color: 'green',
                autoClose: 3000,
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        } else {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete staff. Please try again.',
                color: 'red',
                autoClose: 3000,
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        }
    };
    const profileId = profileData?.user.id
    const hasPermission = profileId;
    const checkExistingMember = (memberId: any) => {
        return staffMembers.some(member => member?.id === memberId);
    };
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await axiosClient.get(`${urls.members.staffOptions}`);
                setFilterOptions(response.data);
            } catch (error) {
                // console.error('Error fetching filter options:', error);
            }
        };
        fetchFilterOptions();
    }, []);
    const handleAddStaff = async () => {
        if (!hasPermission) {
            notifications.show({
                title: 'Permission Denied',
                message: 'You do not have permission to add members.',
                color: 'red',
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
            return;
        }
        if (selectedMemberInModal) {
            try {
                notifications.show({
                    title: 'Adding Member',
                    message: 'Please wait while we send the member a invitation...',
                    loading: true,
                    autoClose: false,
                    id: 'adding-member',
                    style: {
                        position: 'fixed',
                        top: '60px',
                        right: "20px",
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                });
                if (checkExistingMember(selectedMemberInModal.id)) {
                    notifications.show({
                        title: 'Member Already Added',
                        message: 'This member is already part of your staff.',
                        color: 'blue',
                        autoClose: 3000,
                        style: {
                            position: 'fixed',
                            top: '60px',
                            right: "20px",
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                    });
                    setIsModalOpen(false);
                    setSelectedMemberInModal(null);
                    return;
                }
                const loggedUserResponse = await axiosClient.get(
                    `${urls.members.loggedUserID}${merchantId}/`,
                );
                const merchantMemberId = loggedUserResponse.data.merchant_data.id;
                const requestBody = {
                    "merchant": merchantMemberId,
                    "user": selectedMemberInModal.id,
                    "job_type": "full_time",
                }
                const response = await axiosClient.post(
                    `${urls.members.postStaff}`,
                    requestBody,
                );
                notifications.update({
                    id: 'adding-member',
                    title: 'Success',
                    message: 'Member invitation has been successfully sent!',
                    color: 'green',
                    autoClose: 3000,
                    style: {
                        position: 'fixed',
                        top: '60px',
                        right: "20px",
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                });
                if (!selectedMembers.find(m => m.id === selectedMemberInModal.id)) {
                    setSelectedMembers([...selectedMembers, selectedMemberInModal]);
                }
                setIsModalOpen(false);
                setSelectedMemberInModal(null);
                setShowWaitBanner(true);
            } catch (error) {
                notifications.update({
                    id: 'adding-member',
                    title: 'Error',
                    message: 'Failed to add member. Please try again.',
                    color: 'red',
                    autoClose: 3000,
                    style: {
                        position: 'fixed',
                        top: '60px',
                        right: "20px",
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                });
            }
        } else {
            notifications.show({
                title: 'Selection Required',
                message: 'Please select a member to add.',
                color: 'yellow',
            });
        }
    };
    useEffect(() => {
        const bannerFlag = sessionStorage.getItem('showWaitBanner');
        if (bannerFlag === 'true') {
            setShowWaitBanner(true);
            sessionStorage.removeItem('showWaitBanner');
        }
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'showWaitBanner' && event.newValue === 'true') {
                setShowWaitBanner(true);
                sessionStorage.removeItem('showWaitBanner');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
    useEffect(() => {
        if (staffMembers.length > 0 && staffMembers.some(member =>
            member.is_active === true || member.is_active === "true")) {
            setShowWaitBanner(false);
        }
    }, [staffMembers]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get(`${urls.members.getStaff}?full_name=${searchMember}`, {});
                const memberData = response.data.result || response.data;
                setMembers(Array.isArray(memberData) ? memberData : []);
            } catch (error) {
                // console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [searchMember]);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let url = '';
                if (activeTab === "active") {
                    const dateParam = createdAtFilter ? `&created_at=${createdAtFilter}` : '';
                    const activeParam = activeFilter !== null ? `&is_active=${activeFilter}` : '';
                    const jobTypeParam = jobTypeFilter !== null ? `&job_type=${jobTypeFilter}` : '';
                    const roleParam = roleFilter !== null ? `&roles=${roleFilter}` : '';
                    const orderingParam = ordering !== null ? `&ordering=${ordering}` : '';
                    const dateAfterParam = dateAfter ? `&created_at__gte=${dateAfter}` : '';
                    const dateBeforeParam = dateBefore ? `&created_at__lte=${dateBefore}` : '';
                    url = `${urls.members.getStaffList}${merchantId}/?full_name=${searchStaff}${activeParam}${dateParam}${jobTypeParam}${roleParam}${orderingParam}${dateBeforeParam}${dateAfterParam}&page=${page}`;
                } else if (activeTab === "bin") {
                    const dateParam = createdAtFilter ? `&created_at=${createdAtFilter}` : '';
                    const activeParam = activeFilter !== null ? `&is_active=${activeFilter}` : '';
                    const jobTypeParam = jobTypeFilter !== null ? `&job_type=${jobTypeFilter}` : '';
                    const roleParam = roleFilter !== null ? `&roles=${roleFilter}` : '';
                    const orderingParam = ordering !== null ? `&ordering=${ordering}` : '';
                    const dateAfterParam = dateAfter ? `&created_at__gte=${dateAfter}` : '';
                    const dateBeforeParam = dateBefore ? `&created_at__lte=${dateBefore}` : '';
                    url = `/merchant/staff/deleted-list/?full_name=${searchStaff}${activeParam}${dateParam}${jobTypeParam}${roleParam}${orderingParam}${dateBeforeParam}${dateAfterParam}&page=${page}`;
                }
                const response = await axiosClient.get(url, {});

                if (activeTab === "active") {
                    const staffData = response.data.result || [];
                    setTotalItems(response.data.count || staffData.length);
                    setNextPageUrl(response.data.next);
                    setPrevPageUrl(response.data.previous);
                    setStaffMembers(staffData);
                } else {
                    const binStaffData = response.data.result || [];
                    setTotalItems(response.data.count || binStaffData.length);
                    setNextPageUrl(response.data.next);
                    setPrevPageUrl(response.data.previous);
                    setStaffMembers(binStaffData);
                }
            } catch (error) {
                setStaffMembers([]);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab) {  // only gets the data if the activetab has value
            fetchData();
        }
    }, [searchStaff, merchantId, activeFilter, createdAtFilter, jobTypeFilter, roleFilter, requestStatusFilter, activeTab, page, ordering, dateBefore, dateAfter]);
    const sortByName = (ascending = true) => {
        setOrdering(ascending ? 'full_name' : '-full_name');
    };
    const sortByJoinDate = (ascending = true) => {
        setOrdering(ascending ? 'created_at' : '-created_at');
    };
    const handlePermanentDelete = async (member: StaffMember) => {
        try {
            await axiosClient.delete(`/merchant/staff/delete/`, {
                data: {staff_ids: [member.id]}
            });
            notifications.show({
                title: 'Successfully deleted',
                message: 'The staff has been permanently deleted.',
                color: 'green',
                autoClose: 3000,
            });
            setStaffMembers(staffMembers.filter(staff => staff.id !== member.id));
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete staff member permanently. Please try again.',
                color: 'red',
                autoClose: 3000,
            });
        }
    };
    const openDeleteConfirmModal = (member: StaffMember, isPermanent: boolean) => {
        modals.openConfirmModal({
            title: isPermanent ? 'Permanently Delete Staff Member' : 'Delete Staff Member',
            children: (
                <div>
                    <p>Are you sure you want to {isPermanent ? 'permanently ' : ''} <p
                        className="font-semibold mt-2">{member.user?.full_name}</p>delete this staff member?
                    </p>
                    {isPermanent && <p className="text-red-500 ml-20 mt-2">This action cannot be undone.</p>}
                </div>),
            labels: {confirm: 'Delete', cancel: 'Cancel'},
            confirmProps: {color: 'red'},
            onConfirm: () => isPermanent ? handlePermanentDelete(member) : handleDelete(member),
        });
    };
    const setNextClockIndex = React.useCallback(() => {
        setClockIndex(prev => (prev + 1) % 12);
    }, []);
    useEffect(() => {
        const clockInterval = setInterval(setNextClockIndex, 500);
        return () => clearInterval(clockInterval);
    }, [setNextClockIndex]);
    useEffect(() => {
        const dotsInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '.' : prev + '.');
        }, 600);
        return () => clearInterval(dotsInterval);
    }, []);
    const clocks = React.useMemo(() => [
        <Clock1 key="clock1" size={24}/>, <Clock2 key="clock2" size={24}/>, <Clock3 key="clock3" size={24}/>,
        <Clock4 key="clock4" size={24}/>, <Clock5 key="clock5" size={24}/>, <Clock6 key="clock6" size={24}/>,
        <Clock7 key="clock7" size={24}/>, <Clock8 key="clock8" size={24}/>, <Clock9 key="clock9" size={24}/>,
        <Clock10 key="clock10" size={24}/>, <Clock11 key="clock11" size={24}/>, <Clock12 key="clock12" size={24}/>
    ], []);
    const filteredStaffMembers = React.useMemo(() => {
        return staffMembers || [];
    }, [staffMembers]);
    const deleteStaffMember = async (staffIds: string[]) => {
        try {
            const numericIds = staffIds.map(id => parseInt(id));
            await axiosClient.put(`/merchant/staff/delete/?action=soft`, {
                "staff_ids": numericIds
            });
            return true;
        } catch (error) {
            return false;
        }
    };
    const confirmDelete = () => {
        if (selectedMember) {
            setStaffMembers(staffMembers.filter(member => member.id !== selectedMember.id));
            setIsDeleteModalOpen(false);
            setSelectedMember(null);
        }
    };
    const getStatusColor = (is_active: string | boolean) => {
        if (is_active === true || is_active === "true") {
            return 'bg-green-100 text-green-800'; // Available
        } else {
            return 'bg-red-100 text-red-800'; // Unavailable
        }
    };
    const renderGridView = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="dark:bg-gray-300 rounded-lg shadow overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <Skeleton height={128} width={128} radius="xl" className="mb-4"/>
                                    <Skeleton height={20} width={150} radius="sm" className="mb-2"/>
                                    <Skeleton height={14} width={100} radius="sm" className="mb-2"/>
                                    <Skeleton height={28} width={80} radius="xl" className="mt-2"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <>
                {filteredStaffMembers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {filteredStaffMembers.map((member) => (
                            <div
                                key={member.id}
                                style={{
                                    background: dark ? theme.colors.dark[6] : "#fff",
                                    boxShadow: dark ? "gray" : "",
                                    borderRadius: "10px",
                                }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:transform hover:scale-102 hover:shadow-lg"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative w-32 h-32 mb-4">
                                            <div className="w-full h-full rounded-full overflow-hidden">
                                                <img
                                                    src={member.profile_image || "/images/placeholder/personPlaceholder.jpg"}
                                                    alt="Profile placeholder"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {member.kyc_verified && (
                                                <MdVerified
                                                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-blue-500 text-3xl bg-white rounded-full shadow-lg"/>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            {member.user?.full_name}
                                        </h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {Array.isArray(member.roles) && member.roles.length > 0
                                                ? member.roles.join(", ")
                                                : member.roles || ""}
                                            {member.roles && (Array.isArray(member.roles) ? member.roles.length > 0 : true)
                                                ? " \u2022 "
                                                : ""}
                                            {member.job_type}
                                        </div>
                                        <div
                                            className={`px-4 py-1 rounded-full mt-2 text-center ${getStatusColor(member.is_active)}`}
                                        >
                                            {member.is_active === true || member.is_active === "true"
                                                ? "Available"
                                                : "Unavailable"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className=" mt-10 text-gray-500 text-center">
                        No staff members found.
                    </div>
                )}
            </>
        );
    };
    const renderListView = () => {
        return (
            <StaffListView
                loading={loading}
                filteredStaffMembers={filteredStaffMembers}
                activeTab={activeTab}
                dark={dark}
                theme={theme}
                handleEdit={handleEdit}
                openDeleteConfirmModal={openDeleteConfirmModal}
                sortByName={sortByName}
                sortByJoinDate={sortByJoinDate}
                getStatusColor={getStatusColor}
                showWaitBanner={showWaitBanner}
                clocks={clocks}
                clockIndex={clockIndex}
                dots={dots}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                pageSize={staffsPerPage.toString()}
                filterOptions={filterOptions}
                searchStaff={searchStaff}
                activeFilter={activeFilter}
                jobTypeFilter={jobTypeFilter}
                roleFilter={roleFilter}
                setSearchStaff={setSearchStaff}
                setActiveFilter={setActiveFilter}
                setJobTypeFilter={setJobTypeFilter}
                setRoleFilter={setRoleFilter}
                dateAfter={dateAfter}
                setDateAfter={setDateAfter}
                dateBefore={dateBefore}
                setDateBefore={setDateBefore}
            />
        );
    };
    return (
        <Layout heading={"Staff List"}
                breadCrumbsItems={[{name: "Merchant", href: "/merchant/profile"}]}
                currentTitle={"Staff List"}>
            <div><Tabs value={activeTab}
                       onTabChange={(value: React.SetStateAction<string | null>) => {
                           setActiveTab(value);
                           setPage(1);
                       }}
                       styles={{
                           tab: {
                               '&[data-active]': {
                                   color: 'orange',
                               },
                           },
                       }}>
                <Tabs.List className="flex justify-between items-center w-full mb-2">
                    <div className="flex">
                        <Tabs.Tab value="active">Staffs</Tabs.Tab>
                        <Tabs.Tab value="bin">Bin</Tabs.Tab>
                    </div>
                    <Flex justify="flex-end" align="center" wrap="wrap" className={classes.root}
                          mt={{base: 'md', md: 0}}>
                        <Button variant="default" onClick={handleOpenModal} style={{position: "relative", top: "-5px"}}
                                className="bg-orange-500 hover:bg-orange-600 text-white mr-2"> Choose Staff
                        </Button>
                        <Button variant="ghost" className="p-2" onClick={toggleViewMode}>
                            {viewMode === 'grid' ? (
                                <List className="w-5 h-5 hover:text-orange-400"/>
                            ) : (
                                <Grid2X2 className="w-5 h-5 hover:text-orange-400"/>
                            )}
                        </Button>
                    </Flex>
                </Tabs.List>
            </Tabs>
                {/* Header */}
                <Flex direction={{base: 'column', md: 'row'}}
                      justify="space-between"
                      align={{base: 'stretch', md: 'center'}}
                      w="100%" mb={"lg"} gap="md"
                      className={classes.root}>
                    {viewMode !== 'list' && (
                        <FilterComponent
                            searchStaff={searchStaff}
                            setSearchStaff={setSearchStaff}
                            createdAtFilter={createdAtFilter}
                            setCreatedAtFilter={setCreatedAtFilter}
                            activeFilter={activeFilter}
                            setActiveFilter={setActiveFilter}
                            jobTypeFilter={jobTypeFilter}
                            setJobTypeFilter={setJobTypeFilter}
                            roleFilter={roleFilter}
                            setRoleFilter={setRoleFilter}
                            filterOptions={filterOptions}
                            dateAfter={dateAfter}
                            setDateAfter={setDateAfter}
                            dateBefore={dateBefore}
                            setDateBefore={setDateBefore}
                            dateFilterOpen={dateFilterOpen}
                            setDateFilterOpen={setDateFilterOpen}
                        />
                    )}
                </Flex>
                {viewMode === 'grid' ? renderGridView() : renderListView()}

                <Modal opened={isDeleteModalOpen}
                       onClose={() => setIsDeleteModalOpen(false)}
                       title="Confirm Delete" size="sm">
                    <div className="p-4">
                        <p className="mb-4 text-center sm:text-left">Are you sure you want to
                            delete {selectedMember?.user?.full_name}?</p>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button className="bg-red-500 hover:bg-red-600 text-white"
                                    onClick={confirmDelete}>Delete</Button>
                        </div>
                    </div>
                </Modal>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                        <div className="rounded-lg w-full max-w-md">
                            <div style={{
                                color: dark ? "white" : "",
                                background: dark ? theme.colors.dark[6] : "#fff",
                                borderRadius: "7px"
                            }} className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Add Staff</h3>
                                    <button onClick={() => setIsModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700">×
                                    </button>
                                </div>
                                {/* Search Input */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <input type="text" className="w-full border rounded-md pl-3 pr-10 py-2"
                                               placeholder="Search for staff..."
                                               value={searchMember} style={{borderRadius: "7px"}}
                                               onChange={(e) => setSearchMember(e.target.value)}/>
                                        <Search className="absolute right-3 top-2.5 text-gray-400" size={20}/>
                                    </div>
                                </div>
                                {members.length > 0 && (
                                    <div className="text-center text-gray-500 my-4"> Recommend</div>)}
                                {members.length === 0 && (
                                    <div className="text-center text-gray-500 my-4">No staff were found.</div>)}
                                {/* Search Results with Scroll */}
                                <div className="mb-4">
                                    <div className="grid grid-cols-4 gap-4 mb-4 overflow-y-auto"
                                         style={{
                                             maxHeight: '300px', scrollbarWidth: 'thin',
                                             scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent', padding: '4px'
                                         }}>
                                        {/* Show either filtered results when searching, or first 4 members when not searching */}
                                        {(searchMember ? members : members.slice(0, 4)).map(staff => (
                                            <div key={staff.id} style={{
                                                borderRadius: "8px",
                                                border: selectedMemberInModal?.id === staff.id ? '2px solid #F97316' : '1px solid #e2e8f0'
                                            }}
                                                 className={`p-3 cursor-pointer transition-all duration-200 ${
                                                     selectedMemberInModal?.id === staff.id
                                                         ? 'bg-gray-500'
                                                         : 'hover:bg-gray-400 hover:border-orange-300'
                                                 } ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}
                                                 onClick={() => {
                                                     setSelectedMemberInModal(staff);
                                                 }}>
                                                <div className="flex flex-col items-center relative">
                                                    <div
                                                        className="relative w-14 h-14 rounded-full overflow-hidden mb-2">
                                                        <img
                                                            src={staff.profile_img || "/images/placeholder/personPlaceholder.jpg"}
                                                            alt="Profile placeholder"
                                                            className="w-full h-full object-cover"/>
                                                    </div>
                                                    {staff.is_profile_verified && (
                                                        <MdVerified
                                                            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-blue-500 text-xl bg-white p-0.5 rounded-full shadow-lg"/>)}
                                                    <span
                                                        className="text-xs text-center block truncate w-full font-medium">
                        {staff.first_name}<br/> {staff.last_name}
                    </span>
                                                </div>
                                            </div>))}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                    <button onClick={() => setIsModalOpen(false)}
                                            className="w-full sm:flex-1 px-4 py-2 border rounded-md hover:bg-gray-400"
                                            style={{borderRadius: "7px"}}>Cancel
                                    </button>
                                    <Button onClick={handleAddStaff}
                                            className="w-full sm:flex-1 px-4 py-2 bg-orange-500 text-white border rounded-md hover:bg-orange-600"> Add</Button>
                                </div>
                            </div>
                        </div>
                    </div>)}
                {isEditModalOpen && editingStaff && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                        <div className="rounded-lg w-full max-w-md">
                            <div style={{
                                color: dark ? "white" : "",
                                background: dark ? theme.colors.dark[6] : "#fff",
                                borderRadius: "7px"
                            }} className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Edit Staff</h3>
                                    <button onClick={() => setIsEditModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700">×
                                    </button>
                                </div>
                                {/* Form Fields */}
                                <div className="space-y-4 mb-4">
                                    <div><label className="block text-sm font-medium mb-1">Staff Name</label>
                                        <input type="text" className="w-full border rounded-md p-2"
                                               value={formData.staff_name}
                                               onChange={(e) => setFormData({
                                                   ...formData,
                                                   staff_name: e.target.value
                                               })}/>
                                    </div>

                                    <div>
                                        <label className="block text-sm  font-medium mb-1">Primary
                                            Email</label>
                                        <h5 className='text-orange-400'> {editingStaff.user.email} </h5>
                                    </div>
                                    <div><label className="block text-sm font-medium mb-1">Secondary Email</label>
                                        <input type="email" className="w-full border rounded-md p-2"
                                               value={formData.staff_email}
                                               onChange={(e) => setFormData({
                                                   ...formData,
                                                   staff_email: e.target.value
                                               })}/>
                                    </div>

                                    <div><label className="block text-sm font-medium mb-1">Job Type</label>
                                        <Select data={filterOptions.job_types.map(job => ({
                                            value: job.key,
                                            label: job.label
                                        }))}
                                                value={formData.job_type}
                                                onChange={(value) => setFormData({...formData, job_type: value || ''})}
                                                placeholder="Select job type"/>
                                    </div>

                                    <div><label className="block text-sm font-medium mb-2">Roles</label>
                                        <div className="grid grid-cols-2 gap-2"> {/* Adjust grid columns as needed */}
                                            {filterOptions.roles.map((role) => (
                                                <div key={role.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`role-${role.id}`}
                                                        className="rounded border-gray-300"
                                                        checked={formData.roles.includes(Number(role.id))}
                                                        onChange={(e) => {
                                                            const roleId = Number(role.id);
                                                            setFormData({
                                                                ...formData,
                                                                roles: e.target.checked
                                                                    ? [...formData.roles, roleId]
                                                                    : formData.roles.filter(id => id !== roleId),
                                                            });
                                                        }}/>
                                                    <label htmlFor={`role-${role.id}`}
                                                           className="text-sm">{role.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                    <button onClick={() => setIsEditModalOpen(false)}
                                            className="w-full sm:flex-1 px-4 py-2 border rounded-md hover:bg-gray-100"
                                            style={{borderRadius: "7px"}}>Cancel
                                    </button>
                                    <Button onClick={handleUpdateStaff}
                                            className="w-full sm:flex-1 px-4 py-2 bg-orange-500 text-white border rounded-md hover:bg-orange-600">Update</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {viewMode === 'grid' && totalPages > 0 && (
                    <Pagination sx={{width: "100%", bottom: "5%", justifyContent: "center"}}
                                radius="lg" mt={28} total={totalPages}
                                value={page} onChange={(newPage) => setPage(newPage)}
                    />)}
            </div>
        </Layout>
    );
};
export default StaffList;
