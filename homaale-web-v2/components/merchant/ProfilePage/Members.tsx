import React, {useEffect, useState} from 'react';
import { Search } from 'lucide-react';
import {useMantineTheme,Box,Button} from "@mantine/core";
import {useDark} from "@/utils/helpers";
import { useRouter } from 'next/router';
import { IoMdAdd } from "react-icons/io";
import { MdVerified } from "react-icons/md";
import urls from "@/constants/urls";
import {axiosClient} from "@/utils/axiosClient";
import {useProfile} from "@/hooks/useProfile";
import {notifications} from "@mantine/notifications";

interface StaffMember {
    id: string;
    user: {
        full_name: string;
    }
    kyc_verified: boolean;
    job_type: string;
    roles: string[];
    is_active:  string | boolean;
    profile_image: string | null;
}
interface Member {
    id: string;
    first_name: string;
    last_name: string;
    roles: string[];
    type: string;
    position: string;
    is_active:  string | boolean;
    profile_img: string | null;
    is_profile_verified: boolean;
    is_verified: boolean;
    createdBy: string;
    userType: string;
    joinedDate: string;
    email: string;
    permissions:string;

}
const MembersSection = ({ merchantId }: {  merchantId: any }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const theme = useMantineTheme();
    const dark = useDark();
    const [searchMember, setSearchMember] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [selectedMemberInModal, setSelectedMemberInModal] = useState<Member | null>(null);
    const [members, setMembers] = useState<Member[]>([]); // Store fetched members here
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const {data: profileData} = useProfile();
    const profileId = profileData?.user.id
    // Check if the user has the Qualification to be able to permission a modification. //
    const hasPermission = profileId === merchantId;
    const checkExistingMember = (memberId: any) => {
        return staffMembers.some(member => member?.id === memberId);
    };
    const filteredStaff = React.useMemo(() => {
        const query = searchQuery.toLowerCase();
        return members.filter(staff => {
            const firstName = staff?.first_name?.toLowerCase() ?? '';
            const lastName = staff?.last_name?.toLowerCase() ?? '';
            const fullName = `${firstName} ${lastName}`;

            return fullName.includes(query);
        });
    }, [members, searchQuery]);
    const handleAddMember = async () => {
        if(!hasPermission) {
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
                const loggedUserResponse = await axiosClient.get(
                    `${urls.members.loggedUserID}${merchantId}/`,
                );
                const merchantMemberId = loggedUserResponse.data.merchant_data.id;
                const requestBody = {
                    "merchant": merchantMemberId,
                    "user": selectedMemberInModal.id,
                    // "roles": [4],
                    // "permissions": [4],
                    "job_type": "full_time",
                    // "is_active": true
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
                sessionStorage.setItem('showWaitBanner', 'true');
                setIsModalOpen(false);
                setSelectedMemberInModal(null);
                router.push('/StaffList');
            } catch (error) {
                notifications.update({
                    id: 'adding-member',
                    title: 'Error',
                    message: `Failed to add member.`,
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
        }else{
            notifications.show({
                title: 'Selection Required',
                message: 'Please select a member to add.',
                color: 'yellow',
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        }
    };
    const getStatusColor = (is_active: string | boolean) => {
        if (is_active === true || is_active === "true") {
            return 'bg-green-100 text-green-800'; // Available
        } else {
            return 'bg-red-100 text-red-800'; // Unavailable
        }
    };
    const handleNavigateToAddStaff = () => {
        handleCloseModal();
        router.push('/AddStaff');
    };
    const handleNavigateToStaffList = () => {
        router.push('/StaffList');
    };
    // const handleSearch = (query: string) => {
    //     setSearchQuery(query);
    // };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get(`${urls.members.getStaff}?full_name=${searchMember}`, { });
                const memberData = response.data.result || response.data;
                setMembers(Array.isArray(memberData) ? memberData : []);
                // console.log('Fetched members:', memberData);
            } catch (error) {
                // console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [searchMember]);

    useEffect(()=>{
        const fetchData= async()=>{
            try {
                const response = await axiosClient.get(
                    `${urls.members.getStaffList}${merchantId}`, { });
                // console.log(response.data)
                const staffData = response.data.result || [];
                setStaffMembers(staffData);
                // console.log("Staff Members State:", staffData);
            } catch (error) {
                // console.error("Error fetching staff:", error);
                setStaffMembers([]);
            }
        };
        fetchData();
    }, [merchantId]);

    return (
        <div className="p-6 relative  mt-5"
             style={{
                 background: dark ? theme.colors.dark[6] : "#fff",
                 borderRadius: "20px",
                 boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                 border: dark?"1px solid grey":""
             }}>
            {/* Members Section */}
            <h2 className="text-2xl font-semibold mb-4">Members</h2>
            {/* Only shown when no members are selected */}
            {staffMembers.length === 0 ? (
                <div
                    style={{
                        background: dark ? theme.colors.dark[6] : "#fff",
                        borderRadius: "5px",
                    }}
                    className="border p-4 flex flex-col sm:flex-row items-center w-full justify-between gap-4 max-w-full mx-auto"
                >
                    <div className="flex items-center space-x-4 w-full">
                        <div
                            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                                width="36"
                                height="40"
                                viewBox="0 0 36 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M7.375 13.75H28.625C28.9896 13.6979 29.1979 13.4896 29.25 13.125V10.625C29.1979 10.2604 28.9896 10.0521 28.625 10H28C27.9479 8.17708 27.4531 6.5625 26.5156 5.15625C25.526 3.75 24.224 2.70833 22.6094 2.03125L20.5 6.25V1.25C20.4479 0.46875 20.0312 0.0520833 19.25 0H16.75C15.9688 0.0520833 15.5521 0.46875 15.5 1.25V6.25L13.3906 2.03125C11.776 2.70833 10.474 3.75 9.48438 5.15625C8.54688 6.5625 8.05208 8.17708 8 10H7.375C7.01042 10.0521 6.80208 10.2604 6.75 10.625V13.0469C6.80208 13.5156 7.01042 13.75 7.375 13.75ZM18 21.25C16.4896 21.1979 15.1615 20.7292 14.0156 19.8438C12.9219 18.9062 12.2188 17.7083 11.9062 16.25H8.15625C8.52083 18.75 9.58854 20.8333 11.3594 22.5C13.1823 24.1146 15.3958 24.9479 18 25C20.6042 24.9479 22.8177 24.1146 24.6406 22.5C26.4115 20.8333 27.4792 18.75 27.8438 16.25H24.0938C23.7812 17.7083 23.0521 18.9062 21.9062 19.8438C20.8125 20.7292 19.5104 21.1979 18 21.25ZM25.1094 27.5H10.8906C7.97396 27.5521 5.52604 28.5677 3.54688 30.5469C1.56771 32.526 0.552083 34.974 0.5 37.8906C0.604167 39.1927 1.30729 39.8958 2.60938 40H33.3906C34.6927 39.8958 35.3958 39.1927 35.5 37.8906C35.4479 34.974 34.4323 32.526 32.4531 30.5469C30.474 28.5677 28.026 27.5521 25.1094 27.5ZM4.48438 36.25C4.84896 34.7917 5.63021 33.5938 6.82812 32.6562C7.97396 31.7708 9.32812 31.3021 10.8906 31.25H25.1094C26.6719 31.3021 28.026 31.7708 29.1719 32.6562C30.3698 33.5938 31.151 34.7917 31.5156 36.25H4.48438Z"
                                    fill="#868E96"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            {hasPermission ? (
                                <h3 className="font-medium text-base sm:text-lg">No Member Joined</h3>
                            ) : (
                                <h3 className="font-medium text-base sm:text-lg">No Member Found</h3>
                            )}
                            {hasPermission ? (
                                <div className="text-sm text-gray-500 mt-1">
                                    Add Member for your services & reach out more clients.
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 mt-1">
                                    There is no Member found on this services.
                                </div>
                            )}
                        </div>
                    </div>
                    {hasPermission && (
                        <Button
                            onClick={handleOpenModal}
                            variant="outline"
                            style={{borderRadius: "5px"}}
                            className="w-full sm:w-auto min-w-[200px] max-w-[200px] px-3 py-2 sm:text-base"
                        >
                            Add New Member
                        </Button>
                    )}
                </div>
            ) : (
                hasPermission && (
                    <div className="flex justify-end items-center gap-3 mb-5">
                        <Button
                        variant="subtle"
                            onClick={handleOpenModal}
                            sx={{
                                color: dark ? "" : "#211D4F",
                                // color:theme.colors.brand[4],
                                background:"transparent",
                                '&:hover': {
                                color: theme.colors.brand[4],
                                background:"transparent" // Mantine theme color for hover
                                },
                            }}>
                            <IoMdAdd
                                className=" cursor-pointer text-xl"
                                onClick={handleOpenModal}/>
                        </Button>
                        <Button

                        sx={{
                            color:theme.colors.brand[4],
                            background:"transparent",
                            '&:hover': {
                            color: theme.colors.brand[4],
                            background:"transparent" // Mantine theme color for hover
                            },
                        }}
                            onClick={handleNavigateToStaffList}
                            className=" flex underline"
                            variant='subtle'>

                            View All
                        </Button>
                    </div>
                )
            )}
            {/* Selected Members Grid */}
            <div className="overflow-y-auto"
                 style={{
                     maxHeight: '300px',
                     scrollbarWidth: 'thin',
                     scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
                     padding: '4px'
                 }}>
                <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {staffMembers.slice(0, 100).map(member => (
                        <Box key={member.id}
                             style={{
                                 color: dark ? "white" : "",
                                 background: dark ? theme.colors.dark[6] : "#fff",
                                 borderRadius: "5px",
                                 boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                             }}
                             className="hover:bg-gray-800 rounded-lg p-4 shadow-sm border max-h-150">
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32 mb-4">
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                        <img
                                            src={member.profile_image || "/images/placeholder/personPlaceholder.jpg"}
                                            alt="Profile placeholder"
                                            className="w-full h-full object-cover"/>
                                    </div>
                                    {member.kyc_verified && (
                                        <MdVerified
                                            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-blue-500 text-3xl bg-white  rounded-full shadow-lg"/>
                                    )}
                                </div>
                                <h3 className="font-medium text-gray-300 flex">
                                    {member.user?.full_name}
                                    {/*{member.kyc_verified && <MdVerified className="text-blue-500 ml-2 mt-1"/>}*/}
                                </h3>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {Array.isArray(member.roles) && member.roles.length > 0
                                        ? member.roles.join(", ")
                                        : member.roles || ""
                                    }
                                    {member.roles && (Array.isArray(member.roles) ? member.roles.length > 0 : true)
                                        ? " • "
                                        : ""}
                                    {member.job_type}
                                </div>
                                <div
                                    className={`mt-2 px-3 py-1 rounded-full text-sm ${getStatusColor(member.is_active)}`}>
                                    {member.is_active === true || member.is_active === "true" ? "Available" : "Unavailable"}
                                </div>
                            </div>
                        </Box>
                    ))}
                </Box>
            </div>
            {/* Modal */}
            {isModalOpen && hasPermission && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className=" rounded-lg w-full max-w-md mx-4">
                        <div style={{
                            color: dark ? "white" : "",
                            background: dark ? theme.colors.dark[6] : "#fff",
                            borderRadius: "7px"
                        }}
                             className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Add Staff</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700">
                                    ×
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full border rounded-md pl-3 pr-10 py-2"
                                        placeholder="Search for staff..."
                                        value={searchMember}
                                        style={{
                                            borderRadius: "7px"

                                        }}
                                        onChange={(e) => setSearchMember(e.target.value)}/>
                                    <Search className="absolute right-3 top-2.5 text-gray-400" size={20}/>
                                </div>
                            </div>

                            {members.length > 0 && ( <div className="text-center text-gray-500 my-4"> Recommend </div>)}

                            {members.length === 0 && (
                                <div className="text-center text-gray-500 my-4">
                                    No staff were found.
                                </div>
                            )}

                            {/* Search Results with Scroll */}
                            <div className="mb-4">
                                <div
                                    className="grid grid-cols-4 gap-4 mb-4 overflow-y-auto"
                                    style={{
                                        maxHeight: '300px',
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
                                        padding: '4px'
                                    }}>
                                    {/* Show either filtered results when searching, or first 4 members when not searching */}
                                    {(searchMember ? members : members.slice(0, 4)).map(staff => (
                                        <div
                                            key={staff.id}
                                            style={{
                                                borderRadius: "8px",
                                                border: selectedMemberInModal?.id === staff.id ? '2px solid #F97316' : '1px solid #e2e8f0'
                                            }}
                                            className={`p-3 cursor-pointer transition-all duration-200 ${
                                                selectedMemberInModal?.id === staff.id
                                                    ? 'bg-gray-500'
                                                    : 'hover:bg-gray-400 hover:border-orange-300'
                                            } ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}
                                            onClick={() => {
                                                // console.log("Selected staff member:", staff);
                                                setSelectedMemberInModal(staff);
                                            }}>
                                            <div className="flex flex-col items-center relative">
                                                <div
                                                    className="relative w-14 h-14 rounded-full overflow-hidden mb-2">
                                                    <img
                                                        src={staff.profile_img || "/images/placeholder/personPlaceholder.jpg"}
                                                        alt="Profile placeholder"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {staff.is_profile_verified && (
                                                    <MdVerified
                                                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-blue-500 text-xl bg-white p-0.5 rounded-full shadow-lg"/>
                                                )}
                                                <span className="text-xs text-center block truncate w-full font-medium">
                        {staff.first_name}<br/> {staff.last_name}
                    </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-400"
                                    style={{
                                        borderRadius: "7px"
                                    }}>
                                    Cancel
                                </button>
                                <Button
                                    onClick={handleAddMember}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white border rounded-md hover:bg-orange-600">
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default MembersSection;
