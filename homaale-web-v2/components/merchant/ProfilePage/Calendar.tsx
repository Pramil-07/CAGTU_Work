import React, {useEffect, useState} from 'react';
import {
    IconChevronLeft,
    IconChevronRight,
    IconFilterCode,
    IconMaximize,
    IconMinimize,
    IconPlus, IconTrash,
} from '@tabler/icons-react';
import {openConfirmModal} from "@/components/common/form/ConfirmModal";
import {useDark} from "@/utils/helpers";
import {
    ActionIcon,
    Alert,
    Button,
    Card,
    Group,
    Input,
    Modal, Radio,
    Select,
    Stack,
    Text, Flex,
    useMantineTheme,
    Tooltip
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
import DateField from "@/components/common/form/DateField";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {AvailableSlotProps, TimeSlot} from "@/types/merchant/AvailableSlotProps";
import {Plus, Trash} from "lucide-react";
import {DateInput, DatePickerInput} from '@mantine/dates';
import {axiosClient} from "@/utils/axiosClient";
import urls from "@/constants/urls";
import {toast} from "@/components/common/Toast";
import {useProfile} from "@/hooks/useProfile";
import {EntityServiceProps} from "@/types/merchant/EntityServiceProps";
import TimeSlotGenerator from "@/components/merchant/ProfilePage/TimeSlotGenerator";
import {CiViewList} from "react-icons/ci";
import {FiTrash} from "react-icons/fi";


// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

type CalendarEvent = {
    id: string;
    date: string;
    title: string;
};

type SelectedDateTime = {
    date: string;
    start: string;
    end: string;
};

export interface CalendarProps {

    fetchData: (merchantId?: string, serviceId?: string, date?: string) => Promise<AvailableSlotProps[]>;
    events?: CalendarEvent[];
    selectedDateTime?: SelectedDateTime;
    onDateSelect?: (dateTime: SelectedDateTime) => void;
    onEventClick?: (event: CalendarEvent) => void;
    onAddSlot?: (service: string[], date: string, startTime: string, endTime: string, status: string) => void;
    services?: string[];
    className?: string;
    // to update slots
    setAvailableSlotsDataState: React.Dispatch<React.SetStateAction<AvailableSlotProps[]>>;
    AvailableSlotsData: AvailableSlotProps[];
    setSelectedSlotForEdit: React.Dispatch<React.SetStateAction<AvailableSlotProps | null>>;
    selectedSlotForEdit: AvailableSlotProps | null; // The selected slot to edit
    updateAvailableSlots: (updatedSlot: AvailableSlotProps) => void; // Function to update slots
    showAddSlotModal: boolean;
    setShowAddSlotModal: React.Dispatch<React.SetStateAction<boolean>>;
    userEditing: boolean;
    merchantId: string|undefined;
    today: string;
    is_service?:boolean
    separateServiceId?:string

}


// staff interface start
export interface MerchantStaffResponse {
    count: number;
    next: string | null;
    previous: string | null;
    result: MerchantStaff[];
}

export interface MerchantStaff {
    id: number;
    created_at: string; // ISO 8601 Date string
    created_by: CreatedByOrUser;
    user: CreatedByOrUser;
    is_maintainer: boolean;
    is_tasker: boolean;
    job_type: 'full_time' | 'part_time' | 'contract' | string; // Use specific values if known, or allow additional strings
    is_active: boolean;
    kyc_verified: string; // Consider using a boolean or an enum if appropriate
    profile_image: string; // URL or path to the profile image
}

export interface CreatedByOrUser {
    id: string; // UUID
    full_name: string;
    email: string;
    phone: string; // E.164 format or local number format
}

// staff interface ends


const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
] as const;

const CALENDAR_GRID_SIZE = 42; // 6 rows * 7 days

const Calendar: React.FC<CalendarProps> = ({
                                               selectedDateTime,
                                               onAddSlot,
                                               fetchData,
                                               services = [],
                                               className = '',
                                               setSelectedSlotForEdit,
                                               selectedSlotForEdit,
                                               updateAvailableSlots,
                                               showAddSlotModal,
                                               setShowAddSlotModal,
                                               userEditing,
                                               merchantId,
                                               AvailableSlotsData,
                                               setAvailableSlotsDataState,
                                               today,
                                               is_service,
                                               separateServiceId
                                           }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isEditing, setIsEditing] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [selectedService, setSelectedService] = useState<string []>([]);
    const [selectedStatus, setSelectedStatus] = useState<"available" | "fast_filling" | "booked">("available");
    const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const dark = useDark();
    const theme = useMantineTheme();
    const [userSelectedDate, setUserSelectedDate] = useState<string>()
    const [selectedEntityServiceId, setSelectedEntityServiceId] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [errro, setError] = useState("");
    const [entityServiceDataState, setEntityServiceDataState] = useState<EntityServiceProps>()
     const[separateService, setSeparateService]= useState<EntityServiceProps>()
    const [staffData, setStaffData] = useState<MerchantStaffResponse>()
    const [modelServices, setModelServices] = useState<AvailableSlotProps[]>([]);
    const [selectedOption, setSelectedOption] = useState<'generator' | 'manual'>("manual");
    const [filterEntityServiceId, setFilterEntityServiceId] = useState<string | null>(null);


    const handleSelectionChange = (value: 'generator' | 'manual') => {
        setSelectedOption(value);
        setModelServices(defaultService)
    };

    const isMerchantInUrl = (): boolean => {
        return window.location.pathname.includes('merchant');
    };

    const handleAddSlots = () => {
        setShowAddSlotModal(true);
    };

    const handleDeleteAllSlots = () => {
        openConfirmModal({
            title: "Delete Confirmation",
            message: "Are you sure you want to delete all items?",
            onConfirm: async () => {
                try {
                    setLoading(true);
                    await axiosClient.delete(`${urls.merchantSlots.slots}?merchant=${merchantId}`);
                    await fetchData(merchantId, undefined, today);
                    toast.success("All slots deleted successfully");
                } catch (error) {
                    setError("Error while deleting the slots");
                    toast.error("Failed to delete all slots");
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleViewAllSlots = () => {
        fetchData(merchantId);
    };
    const [highlightedDate, setHighlightedDate] = useState(today);

    const {data: profileData} = useProfile();
    const profileId = profileData?.user.id

    const hasPermission = profileId === merchantId;

   console.log("from calendar",separateServiceId)
    const defaultService: AvailableSlotProps[] = [{
        id: '',
        service_time_slots: [
            {
                entity_service: '',
                entity_service_title: '',
                time_slots: [
                    {
                        id: Date.now(), // Use a unique ID (e.g., UUID or timestamp)
                        start_time: '', // Default start time
                        end_time: '', // Default end time
                        status: 'available',
                        seat_count: 10,
                        open_at: new Date().toISOString(),
                        close_at: null,
                        is_active: true,
                        staff: null, // Default staff ID (can be a placeholder)
                    },
                ],
            },
        ],
        merchant: '', // Replace with actual merchant UUID
        is_active: true,
        date: new Date().toISOString().split('T')[0], // Today's date in ISO format
    }];

// Initialize the model with default data when the modal opens

    const dateFormatter = (date: Date | null): string => {
        return dayjs(date).format('YYYY-MM-DD');
    }

    // Clean up body overflow on unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const getDaysInMonth = (date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getPreviousMonthDays = (date: Date) => {
        const firstDay = getFirstDayOfMonth(date);
        const prevMonthDays = [];
        const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1);
        const daysInPrevMonth = getDaysInMonth(prevMonth);

        for (let i = firstDay - 1; i >= 0; i--) {
            prevMonthDays.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i)
            });
        }
        return prevMonthDays;
    };

    const getCurrentMonthDays = (date: Date) => {
        const daysInMonth = getDaysInMonth(date);
        return Array.from({length: daysInMonth}, (_, i) => ({
            day: i + 1,
            isCurrentMonth: true,
            date: new Date(date.getFullYear(), date.getMonth(), i + 1)
        }));
    }

    const getNextMonthDays = (date: Date, currentMonthDays: number) => {
        const remainingDays = CALENDAR_GRID_SIZE - currentMonthDays;
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1);
        return Array.from({length: remainingDays}, (_, i) => ({
            day: i + 1,
            isCurrentMonth: false,
            date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i + 1)
        }));
    };



    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(currentDate.setMonth(
            currentDate.getMonth() + (direction === 'next' ? 1 : -1)
        )));
    };

    const navigateYear = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(currentDate.setFullYear(
            currentDate.getFullYear() + (direction === 'next' ? 1 : -1)
        )));
    };

    useEffect(() => {

        fetchData(merchantId, undefined, today)
    }, [today]);

    const handleDayClick = async (dayInfo: { date: Date; isCurrentMonth: boolean }) => {
        if (dayInfo.isCurrentMonth) {
            // Create a new Date object from the selected date
            const selectedDate = new Date(dayInfo.date);
            // Format the selected date to YYYY-MM-DD
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            const SelectedFormattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
            console.log("this is handle day click", SelectedFormattedDate)

            setHighlightedDate(formattedDate);
            const data = await fetchData(merchantId, undefined, SelectedFormattedDate)
            setAvailableSlotsDataState(data)
            // Store both the Date object and formatted string if needed
            setSelectedSlotDate(selectedDate);
            setUserSelectedDate(formattedDate)
            setSelectedSlotForEdit(null);

        }
    };

    const handleFilter = async (value: string) => {
        setFilterEntityServiceId(value);
        if (!value) return;
        console.log("filter value", value)

        try {
            const data = await fetchData(merchantId, value, undefined)

            if (data) {
                setAvailableSlotsDataState(data)
            }
        } catch (error) {
            toast.error("Failed to fetch filtered slots");
        }
    };


    const handleZoomToggle = () => {
        setIsZoomed(!isZoomed);
        document.body.style.overflow = !isZoomed ? 'hidden' : 'unset';
    };

    const getCalendarContainerClasses = () => {
        if (isZoomed) {
            return 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all duration-300';
        }
        return `relative w-full max-w-50 ${className}`;
    };

    const getCalendarContentClasses = () => {
        if (isZoomed) {
            return 'bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100';
        }
        return 'p-6 bg-warm rounded-xl shadow-sm transform transition-transform duration-300 scale-100';
    };

    // Add time handling functions
    const handleStartTimeChange = (value: string) => {

        setStartTime(value);
        // Clear end time if start time is after it
        if (endTime && value > endTime) {
            setEndTime('');
        }
    };

    const handleEndTimeChange = (value: string) => {
        if (!startTime) {
            return;
        }
        if (value > startTime) {
            setEndTime(value);
        }
    };
    // Entity service fetch
    const fetchEntityData = async () => {
        try {
            setLoading(true);
            const {data: fetchedEntityServiceData} = await axiosClient.get(`${urls.entity.myService}${merchantId}`,);
            if (fetchedEntityServiceData) {
                setEntityServiceDataState(fetchedEntityServiceData);


            }
            else {
                console.warn("Received undefined or invalid data:", fetchedEntityServiceData);
            }
        } catch (error) {
            console.error("Error fetching entity data:", error);
            setError("Failed to fetch entity");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchEntityData();
    }, []);




console.log("separateservice",separateServiceId)
    // fetch staff list of merchant
    const fetchStaffData = async () => {
        try {
            setLoading(true);

            const {data: fetchedStaffData} = await axiosClient.get(`${urls.merchantSlots.staff}${merchantId}`,);


            if (fetchedStaffData) {
                setStaffData(fetchedStaffData);
                console.log("staff", fetchedStaffData)

            } else {
                console.warn("Received undefined or invalid data:", fetchedStaffData);
            }
        } catch (error) {
            console.error("Error fetching staff data:", error);
            setError("Failed to fetch staff");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStaffData();

    }, []);

    console.log("selectedSlotForEdit", selectedSlotForEdit)

    useEffect(() => {
        if (showAddSlotModal) {
            if (selectedSlotForEdit) {
                const mappedSlot: AvailableSlotProps = {
                    id: selectedSlotForEdit.id || Date.now().toString(),
                    merchant: selectedSlotForEdit.merchant || '', // Ensure UUID or empty string
                    is_active: selectedSlotForEdit.is_active ?? true,
                    date: selectedSlotForEdit.date, // ISO 8601 format
                    service_time_slots: selectedSlotForEdit.service_time_slots.map((serviceSlot: any) => ({
                        id: serviceSlot.id || Date.now(),
                        entity_service: serviceSlot.entity_service,
                        entity_service_title: serviceSlot.entity_service_title,
                        time_slots: serviceSlot.time_slots.map((timeSlot: any) => ({
                            id: timeSlot.id || `${Date.now()}${Math.random}`, // Ensure unique ID for new slots
                            start_time: timeSlot.start_time || '',
                            end_time: timeSlot.end_time || '',
                            status: timeSlot.status || 'available',
                            seat_count: timeSlot.seat_count || 10,
                            open_at: timeSlot.open_at || new Date().toISOString(),
                            close_at: timeSlot.close_at || null,
                            is_active: timeSlot.is_active ?? true,
                            staff: timeSlot.staff || null,
                        })),
                    })),
                };
                const nepalTime = dayjs(selectedSlotForEdit.date).tz('Asia/Kathmandu').format('ddd MMM DD YYYY HH:mm:ss [GMT]Z [(Nepal Time)]');
                setSelectedSlotDate(dayjs(nepalTime).toDate())

                setModelServices([mappedSlot]);


            } else if (showAddSlotModal) {

                setModelServices(defaultService);
            }
        }
    }, [showAddSlotModal, selectedSlotForEdit]);

    const handleAddSlot = async () => {

        if (selectedSlotDate && selectedService) {
            try {

                const slotDate = dateFormatter(selectedSlotDate);

                const payload = {
                    merchant: merchantId,
                    is_active: true,
                    date: slotDate,
                    service_time_slots: modelServices.flatMap((service) =>
                        service.service_time_slots.map((serviceSlot) => ({
                            entity_service: serviceSlot.entity_service,
                            time_slots: (serviceSlot.time_slots || []).map((slot) => ({
                                start_time: slot.start_time,
                                end_time: slot.end_time,
                                status: slot.status || "available",
                                open_at: new Date().toISOString(),
                                close_at: slot.close_at || null,
                                is_active: slot.is_active ?? true,
                                staff: slot.staff || null,
                            })),
                        }))
                    ),
                };

                console.log("payload", payload)


                await axiosClient.post(`${urls.merchantSlots.slots}?merchant=${merchantId}`, payload);
                if (onAddSlot) {
                    onAddSlot(
                        selectedService,
                        slotDate,
                        selectedStatus,
                        startTime,
                        endTime
                    );
                }

                setShowAddSlotModal(false);
                resetModalState();
                fetchData(merchantId, undefined, slotDate);
            } catch (error) {
                toast.error((error as Error).message);
            }
        } else {
            console.warn("Required fields are missing!");
            toast.error("Required fields are missing!");

        }
    };

    const handleTimeSlotGeneration = (serviceIndex: number, generatedSlots: { start: string; end: string }[]) => {
        setModelServices((prev) =>
            prev.map((service, idx) => {
                if (idx !== serviceIndex) return service; // Skip non-matching services

                const updatedServiceTimeSlots = service.service_time_slots.map((slot) => ({
                    ...slot,
                    time_slots: generatedSlots.map((slotPair) => ({
                        id: Math.floor(Math.random() * 1000),
                        start_time: slotPair.start,
                        end_time: slotPair.end,
                        seat_count: 1,
                        open_at: new Date().toISOString(),
                        close_at: null,
                        is_active: true,

                    })),
                }));

                return {
                    ...service,
                    service_time_slots: updatedServiceTimeSlots,
                };
            })
        );

    };
    console.log("interval", modelServices)


    const handleUpdateSlot = async () => {
        if (selectedSlotForEdit) {
            try {
                const slotDate = dateFormatter(selectedSlotDate);

                const payload = {
                    is_active: true,
                    date: slotDate,
                    merchant: merchantId,
                    service_time_slots: modelServices.flatMap((service) =>
                        service.service_time_slots.map((serviceSlot) => ({
                            service_time_slots_id: serviceSlot.id,
                            entity_service: serviceSlot.entity_service,
                            time_slots: (serviceSlot.time_slots || []).map((slot) => ({
                                time_slots_id: slot.id,
                                start_time: slot.start_time,
                                end_time: slot.end_time,
                                status: slot.status || "available",
                                open_at: new Date().toISOString(),
                                close_at: slot.close_at || null,
                                is_active: slot.is_active ?? true,
                                staff: slot.staff || null,
                                // staff_name:slot.staff_name
                            })),
                        }))
                    ),
                };
                const response = await axiosClient.put(`${urls.merchantSlots.slots}?merchant=${merchantId}&daily_schedule=${selectedSlotForEdit.id}`, payload);

                if (response.status === 200) {
                    console.log("Slot updated successfully:", response.data);
                    setShowAddSlotModal(false);
                    resetModalState();
                    fetchData(merchantId);
                }
            } catch (error) {
                console.error("Error updating slot:", ((error as Error).message || error));
            }
        } else {
            console.warn("Required fields are missing or invalid slotId!");
        }
    };


    const handleDropdown = async (selectedValue: string, serviceIndex: number, slotIndex: number) => {
        const selectedService = entityServiceDataState?.result?.find((item) => item.id === selectedValue);

        if (selectedService) {
            // Update the specific serviceSlot in the modelServices state with the new service data
            setModelServices((prevServices) =>
                prevServices.map((service, sIndex) =>
                    sIndex === serviceIndex
                        ? {
                            ...service,
                            service_time_slots: service.service_time_slots.map((slot, tIndex) =>
                                tIndex === slotIndex
                                    ? {
                                        ...slot,
                                        entity_service: selectedService.id,
                                        entity_service_title: selectedService.title,
                                    }
                                    : slot
                            ),
                        }
                        : service
                )
            );
            console.log("Selected service:", selectedService.id, selectedService.title);
            setSelectedEntityServiceId(() => selectedService.id);


        }

    };

    console.log("entiity data service ",entityServiceDataState )


    const handelStaffDropdown = (selectedValue: string | null, serviceId: string, timeSlotId: number) => {
        const selectedStaff = staffData?.result?.find(item => item.id.toString() === selectedValue);

        if (selectedStaff) {
            setModelServices((prevServices) =>
                prevServices.map((service) => {
                    if (service.id === serviceId) {
                        return {
                            ...service,
                            service_time_slots: service.service_time_slots.map((timeSlot) => {
                                return {
                                    ...timeSlot,
                                    time_slots: timeSlot.time_slots.map((slot) => {
                                        if (slot.id === timeSlotId) {
                                            return {...slot, staff: selectedStaff.id}; //  Updates only the selected slot
                                        }
                                        return slot;
                                    }),
                                };
                            }),
                        };
                    }
                    return service;
                })
            );
        }

        console.log("Selected Staff:", selectedStaff?.id);
    };


    const resetModalState = () => {
        setSelectedService([]);
        setSelectedStatus("available");
        setSelectedSlotDate(null);
        setStartTime('');
        setEndTime('');
        setModelServices([]);
        setSelectedSlotForEdit(null)
    };

    const handleCloseModal = () => {
        setShowAddSlotModal(false);
        resetModalState();
    };

    const prevMonthDays = getPreviousMonthDays(currentDate);
    const currentMonthDays = getCurrentMonthDays(currentDate);
    const nextMonthDays = getNextMonthDays(
        currentDate,
        prevMonthDays.length + currentMonthDays.length
    );
    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

// model handler start
    const addTimeSlot = (serviceId: string): void => {
        setModelServices((prevServices) =>
            prevServices.map((service) => {
                if (service.id === serviceId) {
                    return {
                        ...service,
                        service_time_slots: service.service_time_slots.map((serviceTimeSlot) => ({
                            ...serviceTimeSlot,
                            time_slots: [
                                ...serviceTimeSlot.time_slots, // Spread the existing time slots first
                                {
                                    id: Date.now(),
                                    start_time: '',
                                    end_time: '',
                                    status: 'available',
                                    seat_count: 0,
                                    open_at: '',
                                    close_at: null,
                                    is_active: true,
                                    staff: null,
                                },
                            ],
                        })),
                    };
                }
                return service;
            })
        );
    };


    const addService = (): void => {

        setModelServices((prevServices) => [
            ...prevServices,
            {
                id: Date.now().toString(),
                service_time_slots: [
                    {
                        entity_service: '',
                        entity_service_title: '',
                        time_slots: []
                    },
                ],
                merchant: '',
                is_active: true,
                date: new Date().toISOString()
            }
        ]);
    };

    const removeService = (serviceId: string): void => {
        setModelServices((prevServices) => prevServices.filter(service => service.id !== serviceId));
    };

    const updateTimeSlot = (
        serviceId: string,
        timeSlotId: number,
        field: keyof TimeSlot,
        value: string
    ) => {
        setModelServices((services) =>

            services.map((service) => {
                if (typeof service === 'object' && 'id' in service && service.id === serviceId) {
                    const updatedTimeSlots = service.service_time_slots.map((slot) => ({
                        ...slot,
                        time_slots: slot.time_slots.map((t) =>
                            t.id === timeSlotId ? {...t, [field]: value} : t),
                    }));
                    return {...service, service_time_slots: updatedTimeSlots};
                }
                return service;
            })
        );
        setShowAddSlotModal(true)
    };

    const removeTimeSlot = (serviceId: string, timeSlotId: number) => {

        setModelServices((services) =>
            services.map((service) => {
                // Type guard to ensure service is an AvailableSlotProps
                if (typeof service === 'object' && 'id' in service && service.id === serviceId) {
                    const updatedTimeSlots = service.service_time_slots.map((slot) => ({
                        ...slot,
                        time_slots: slot.time_slots.filter((t) => t.id !== timeSlotId),
                    }));
                    return {...service, service_time_slots: updatedTimeSlots};
                }
                return service;
            })
        );
    };

// model handler end
    return (
        <div>
            {isZoomed && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
                    onClick={handleZoomToggle}
                />
            )}
            <div className={getCalendarContainerClasses()}>
                <div style={{

                    background: dark ? theme.colors.dark[6] : "#fff",
                    marginBottom: "10px",
                    borderRadius: "20px",
                    border: dark ? "1px solid grey" : "1px solid lightgray",


                }}
                     className={getCalendarContentClasses()}
                     onClick={e => e.stopPropagation()}
                >
                    {/* Year Navigation */}
                    <div className="flex justify-end items-center ">
                        <div className="flex items-center gap-4">
                            {/*        <div className="flex items-center gap-2">*/}
                            {/*            <button*/}
                            {/*                onClick={() => navigateYear('prev')}*/}
                            {/*                className="p-1 rounded transition-colors"*/}
                            {/*                aria-label="Previous year"*/}
                            {/*            >*/}
                            {/*                <IconChevronLeft style={{*/}
                            {/*                    background: dark ? theme.colors.dark[6] : "#fff",*/}
                            {/*                }}*/}
                            {/*                                 className="w-5 h-5 hover:text-orange-400 dark:text-gray-400"/>*/}
                            {/*            </button>*/}
                            {/*            <span className="text-xl font-medium text-gray-700 dark:text-gray-200">*/}
                            {/*                {currentDate.getFullYear()}*/}
                            {/*            </span>*/}
                            {/*            <button*/}
                            {/*                onClick={() => navigateYear('next')}*/}
                            {/*                className="p-1 rounded transition-colors"*/}
                            {/*                aria-label="Next year"*/}
                            {/*            >*/}
                            {/*                <IconChevronRight style={{*/}
                            {/*                    background: dark ? theme.colors.dark[6] : "#fff",*/}
                            {/*                }} className="w-5 h-5 hover:text-orange-400 dark:text-gray-400"/>*/}
                            {/*            </button>*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*    <div className="flex gap-2">*/}
                            {/*        {(hasPermission &&*/}
                            {/*            <button*/}
                            {/*                className="p-1 rounded transition-colors"*/}
                            {/*                onClick={() => setIsEditing(!isEditing)}*/}
                            {/*                aria-label={isEditing ? "Save" : "Edit"}*/}
                            {/*            >*/}
                            {/*                {isEditing ? (*/}
                            {/*                    <FiSave style={{*/}
                            {/*                        background: dark ? theme.colors.dark[6] : "#fff",*/}
                            {/*                    }}*/}
                            {/*                            className="w-5 h-5 hover:text-orange-400"/>*/}
                            {/*                ) : (*/}
                            {/*                    <FiEdit style={{*/}
                            {/*                        background: dark ? theme.colors.dark[6] : "#fff",*/}
                            {/*                    }}*/}
                            {/*                            className="w-5 h-5 hover:text-orange-400"/>*/}
                            {/*                )}*/}
                            {/*            </button>*/}
                            {/*        )}*/}
                            {/*        <button*/}
                            {/*            className="p-1  rounded transition-colors"*/}
                            {/*            onClick={handleZoomToggle}*/}
                            {/*            aria-label={isZoomed ? 'Minimize' : 'Maximize'}*/}
                            {/*        >*/}
                            {/*            {isZoomed ? (*/}
                            {/*                <IconMinimize style={{*/}
                            {/*                    background: dark ? theme.colors.dark[6] : "#fff",*/}
                            {/*                }}*/}
                            {/*                              className="w-5 h-5 hover:text-orange-400"/>*/}
                            {/*            ) : (*/}
                            {/*                <IconMaximize style={{*/}
                            {/*                    background: dark ? theme.colors.dark[6] : "#fff",*/}
                            {/*                }}*/}
                            {/*                              className="w-5 h-5 hover:text-orange-400"/>*/}
                            {/*            )}*/}
                            {/*        </button>*/}
                                <div className="flex flex-wrap">
                                    {hasPermission && (
                                        <Tooltip
                                            label={"Add Slots"}
                                            withArrow
                                            position='top'
                                        >
                                        <Button
                                            className=" font-semibold"
                                            sx={{
                                                color:"black",
                                                background:"transparent",
                                                '&:hover': {
                                                color: theme.colors.brand[4],
                                                background:"transparent" // Mantine theme color for hover
                                                },
                                            }}
                                            variant='subtle'
                                            onClick={handleAddSlots}
                                        >
                                            <IconPlus size={18}/>
                                        </Button>
                                        </Tooltip>
                                    )}
                                    {hasPermission && (
                                        <Tooltip
                                            label={"Delete All Slots"}
                                            withArrow
                                            position='top'
                                        >
                      <Button
                        className="font-semibold"

                        sx={{
                            padding:"1px",
                            color:"black",
                            background:"transparent",
                            '&:hover': {
                            color: theme.colors.brand[4],
                            background:"transparent" // Mantine theme color for hover
                            },
                        }}
                        variant="subtle" // Minimal styling to mimic a plain button
                        onClick={handleDeleteAllSlots}
                        >
                        <FiTrash size={15} />
                        </Button>
                                        </Tooltip>
                                    )}
                                </div>
                            <span
                            style={{color:theme.colors.brand[4]}}
                                className="flex gap-1 items-center text-base cursor-pointer hover:text-orange-300 active:text-orange-700 transition-all duration-300"
                                onClick={handleViewAllSlots}
                            >
                                View All <CiViewList/>
                            </span>
                        </div>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex justify-between items-center">
                        {/*<div className="flex items-center gap-4">*/}
                        {/*    <div className="flex items-center gap-2">*/}
                        {/*        <button*/}
                        {/*            onClick={() => navigateMonth('prev')}*/}
                        {/*            className="p-1 rounded transition-colors"*/}
                        {/*            aria-label="Previous month"*/}
                        {/*        >*/}
                        {/*            <IconChevronLeft style={{*/}
                        {/*                background: dark ? theme.colors.dark[6] : "#fff",*/}
                        {/*            }}*/}
                        {/*                             className="w-5 h-5 hover:text-orange-400 dark:text-gray-400"/>*/}
                        {/*        </button>*/}
                        {/*        <span className="text-xl font-medium text-gray-700 dark:text-gray-200">*/}
                        {/*            {MONTHS[currentDate.getMonth()]}*/}
                        {/*        </span>*/}
                        {/*        <button*/}
                        {/*            onClick={() => navigateMonth('next')}*/}
                        {/*            className="p-1 rounded transition-colors"*/}
                        {/*            aria-label="Next month"*/}
                        {/*        >*/}
                        {/*            <IconChevronRight style={{*/}
                        {/*                background: dark ? theme.colors.dark[6] : "#fff",*/}
                        {/*            }}*/}
                        {/*                              className="w-5 h-5 hover:text-orange-400 dark:text-gray-400"/>*/}
                        {/*        </button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                            <div className="flex items-center gap-4" style={{ zIndex: 100}}>
                                <div>
                            <DatePickerInput
                                // id="date_from"
                                // name="date_from"
                                label="Select Date"
                                placeholder={`${dayjs(today).format('MMMM D, YYYY')}`}
                                value={selectedSlotDate}
                                rightSection={
                                    selectedSlotDate && (
                                        <ActionIcon
                                            size={25}
                                            variant="transparent"
                                            onClick={() => {
                                                setSelectedSlotDate(null);
                                                setHighlightedDate(today);
                                                setUserSelectedDate(today);
                                                fetchData(merchantId, undefined, today).then(data => {
                                                    setAvailableSlotsDataState(data);
                                                    setSelectedSlotForEdit(null);
                                                });
                                            }}
                                        >
                                            <IconX size={14} color={theme.colors.gray[7]}/>
                                        </ActionIcon>
                                    )
                                }
                                icon={<IconCalendarEvent size={20} color={theme.colors.brand[3]}/>}
                                // maxDate={new Date()}
                                maw={180}
                                radius="md"
                                size="md"
                                onChange={(value) => {
                                    setSelectedSlotDate(value);
                                    if (value) {
                                        const formattedDate = dayjs(value).format('YYYY-MM-DD');
                                        setHighlightedDate(formattedDate);
                                        setUserSelectedDate(formattedDate);
                                        fetchData(merchantId, undefined, formattedDate).then(data => {
                                            setAvailableSlotsDataState(data);
                                            setSelectedSlotForEdit(null);
                                        });
                                    }
                                }}
                            />
                        </div>
                            </div>

                        {isMerchantInUrl() && (
                            <div className="mt-5 flex justify-end">
                                {/*{showFilter && (*/}
                                <div className="flex flex-row items-center gap-4">
                                    <Select
                                        size="md"
                                        radius="md"
                                        maw={180}
                                        placeholder="Filter by Service"
                                        value={filterEntityServiceId}
                                        onChange={(value: string) => handleFilter(value)}
                                        data={
                                            entityServiceDataState?.result?.map((item: any) => ({
                                                value: item.id,
                                                label: item.title,
                                            })) || []
                                        }

                                        clearable
                                    />

                                </div>
                                {/*/!*)}*!/*/}
                                {/*<button*/}
                                {/*    className="p-1 rounded transition-colors justify-end"*/}
                                {/*    aria-label="Filter"*/}
                                {/*    onClick={() => setShowFilter((prev) => !prev)}*/}
                                {/*>*/}
                                {/*    <IconFilterCode style={{*/}
                                {/*        background: dark ? theme.colors.dark[6] : "#fff",*/}
                                {/*    }}*/}
                                {/*                    className="w-5 h-5 hover:text-orange-400"/>*/}
                                {/*</button>*/}

                            </div>
                        )}
                    </div>


                    {/* Calendar Grid*/}
                    {/*<div className="grid grid-cols-7 gap-2 mb-2">*/}
                    {/*    {DAYS_IN_WEEK.map(day => (*/}
                    {/*        <div key={day} className="text-center text-sm text-gray-400 dark:text-gray-500 font-medium">*/}
                    {/*            {day}*/}
                    {/*        </div>*/}
                    {/*    ))}*/}
                    {/*</div>*/}

                    {/*<div className="grid grid-cols-7 gap-2">*/}
                    {/*    {allDays.map((dayInfo, index) => {*/}
                    {/*        const formattedDate = dayjs(dayInfo.date).format('YYYY-MM-DD');*/}
                    {/*        const isToday = formattedDate === today;*/}
                    {/*        const isSelected = highlightedDate === formattedDate;*/}

                    {/*        return (*/}
                    {/*            <div*/}
                    {/*                key={`${dayInfo.day}-${index}`}*/}
                    {/*                className="relative"*/}
                    {/*            >*/}
                    {/*                <button*/}
                    {/*                    className={`*/}
                    {/*                        w-full h-10 flex items-center justify-center rounded-lg*/}
                    {/*                        ${isToday && !isSelected ? 'bg-gray-200 text-gray-700' : dayInfo.isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}*/}
                    {/*                        ${isSelected ? 'bg-orange-300 text-white' : 'hover:bg-orange-100'}*/}
                    {/*                        ${!dayInfo.isCurrentMonth && 'cursor-default'}*/}
                    {/*                        ${isEditing && dayInfo.isCurrentMonth ? 'cursor-pointer' : ''}*/}
                    {/*                    `}*/}
                    {/*                    onClick={() => handleDayClick(dayInfo)}*/}
                    {/*                    disabled={!dayInfo.isCurrentMonth}*/}
                    {/*                >*/}
                    {/*                    {dayInfo.day}*/}
                    {/*                </button>*/}
                    {/*            </div>*/}
                    {/*        );*/}
                    {/*    })}*/}
                    {/*</div>*/}


                </div>
            </div>

            {/* Add Slot Modal */}


            <Modal
                opened={showAddSlotModal}
                onClose={handleCloseModal}
                title={<Text size="xl" weight={700}> {selectedSlotForEdit ? "Update Slot" : "Create New Slot"}</Text>}
                size="xl"
                padding="md"
                zIndex={150}
            >
                <Stack spacing="md">
                    <Group position="right">
                        {!selectedSlotForEdit &&
                            (<Button
                                leftIcon={<Plus size={16}/>}
                                onClick={addService}
                                variant="filled"
                                color="orange"
                            >
                                Add New Service
                            </Button>)}
                    </Group>

                    {services.length === 0 && !selectedSlotForEdit && (
                        <Alert color="orange" title="services added">
                            Click the &#34;Add New Service&#34; button to add services
                        </Alert>
                    )}
                    <DatePickerInput
                        label="Pick date"
                        placeholder="Pick date"
                        value={selectedSlotDate}
                        onChange={setSelectedSlotDate}
                        className="w-1/4 mx-4 "
                        required
                    />

                    {
                        modelServices.map((service, serviceIndex) => (
                            <Card key={serviceIndex} p="md" radius="md">
                                {service.service_time_slots.map((serviceSlot, index) => (
                                    <Card key={index} shadow="sm" p="md" radius="md" withBorder>
                                        <Stack spacing="md">
                                            <Group position="apart">
                                                <Text weight={500} size="lg">
                                                    {serviceSlot.entity_service_title || 'New Service'}
                                                </Text>
                                                {!selectedSlotForEdit &&
                                                    (<ActionIcon
                                                        color="red"
                                                        onClick={() => removeService(service.id)}
                                                        variant="subtle"
                                                    >
                                                        <Trash size={16}/>
                                                    </ActionIcon>)}

                                            </Group>

                                            <Select
                                                key={index}
                                                label="Select Service"
                                                placeholder="Choose a service"
                                                value={serviceSlot.entity_service}
                                                data={entityServiceDataState?.result?.filter((item) => {
                                                    if (is_service && separateServiceId) {
                                                        return separateServiceId === item.id
                                                    }
                                                    return true
                                                }).map((item: any) => ({
                                                value: item.id,
                                                label: item.title,
                                            })) || []}
                                            onChange={(value: string) => handleDropdown(value, serviceIndex, index)}
                                            dropdownPosition="bottom"
                                            withinPortal
                                            zIndex={1000}
                                            required

                                        />
                                        {!selectedSlotForEdit && (<Group>
                                            <Radio
                                                value="generator"
                                                label="Time Slot Generator"
                                                checked={selectedOption === 'generator'}
                                                onChange={() => handleSelectionChange('generator')}
                                            />
                                            <Radio
                                                value="manual"
                                                label="Manual Selection"
                                                checked={selectedOption === 'manual'}
                                                onChange={() => handleSelectionChange('manual')}
                                            />
                                        </Group>)}
                                        {selectedOption === 'generator' && !selectedSlotForEdit && (
                                            <TimeSlotGenerator
                                                serviceIndex={serviceIndex}
                                                selectedSlotForEdit={selectedSlotForEdit}
                                                showAddSlotModal={showAddSlotModal}
                                                setShowAddSlotModal={setShowAddSlotModal}
                                                onGenerate={handleTimeSlotGeneration}
                                                handelStaffDropdown={handelStaffDropdown}
                                                staffData={staffData}
                                                modelServices={modelServices}
                                                setModelServices={setModelServices}
                                            />)}

                                        {selectedOption === "manual" && (
                                            <Stack spacing="xs">
                                                <Group position="apart">
                                                    <Text weight={500}>Time Slots</Text>
                                                    {!selectedSlotForEdit && selectedOption === 'manual' &&

                                                        (<Button
                                                            variant="subtle"
                                                            size="sm"
                                                            onClick={() => addTimeSlot(service.id)}
                                                            leftIcon={<Plus size={16}/>}
                                                        >
                                                            Add Time Slot
                                                        </Button>)}
                                                </Group>


                                                {!selectedSlotForEdit ? serviceSlot.time_slots.map((timeSlot, index) => (
                                                        <Card key={index} withBorder p="sm">
                                                            <Stack spacing="sm" className="gap-4">

                                                                <Group grow className="items-center gap-4">
                                                                    <Text>Start Time</Text>

                                                                    <Input
                                                                        className="w-[128px]"
                                                                        type="time"
                                                                        value={timeSlot.start_time}
                                                                        onChange={(event) => {
                                                                            handleStartTimeChange(event.currentTarget.value);
                                                                            updateTimeSlot(
                                                                                service.id,
                                                                                timeSlot.id,
                                                                                'start_time',
                                                                                event.currentTarget.value
                                                                            )
                                                                        }}
                                                                        required
                                                                    />
                                                                    <Text>End Time</Text>
                                                                    <Input
                                                                        className="w-[128px]"
                                                                        type="time"
                                                                        value={timeSlot.end_time}
                                                                        onChange={(event) => {
                                                                            handleEndTimeChange(event.currentTarget.value);
                                                                            updateTimeSlot(
                                                                                service.id,
                                                                                timeSlot.id,
                                                                                'end_time',
                                                                                event.currentTarget.value
                                                                            )
                                                                        }}

                                                                        required
                                                                    />
                                                                </Group>


                                                                <Group grow className="items-center gap-4">
                                                                    {/*<Text>Assign Staff</Text>*/}
                                                                    <Select
                                                                        label="Staff"
                                                                        value={timeSlot.staff !== null ? timeSlot.staff?.toString() : ""}
                                                                        data={[{
                                                                            value: "",
                                                                            label: "None"
                                                                        },
                                                                            ...(staffData?.result?.map((item: any) => ({
                                                                                value: item.id?.toString() || "unknown_id",
                                                                                label: item.user?.full_name || "Unknown Name",
                                                                            })) || [])
                                                                        ]}
                                                                        placeholder="Select a Staff"
                                                                        required
                                                                        onChange={(selectedValue) => handelStaffDropdown(selectedValue === "" ? null : selectedValue, service.id, timeSlot.id)}
                                                                        dropdownPosition="bottom"
                                                                        withinPortal
                                                                        zIndex={1000}
                                                                    />
                                                                    <Select
                                                                        label="Status"
                                                                        value={timeSlot.status}
                                                                        dropdownPosition="bottom"
                                                                        withinPortal
                                                                        zIndex={1000}
                                                                        data={[
                                                                            {value: 'available', label: 'Available'},
                                                                            {value: 'fast_filling', label: 'Fast Filling'},
                                                                            {value: 'booked', label: 'Booked'},
                                                                        ]}
                                                                        onChange={(selectedValue: string) =>
                                                                            updateTimeSlot(service.id, timeSlot.id, 'status', selectedValue)
                                                                        }
                                                                    />

                                                                </Group>

                                                            </Stack>
                                                            {!selectedSlotForEdit &&
                                                                (<ActionIcon
                                                                    color="red"
                                                                    onClick={() => removeTimeSlot(service.id, timeSlot.id)}
                                                                    variant="subtle"
                                                                    style={{marginTop: '24px'}}
                                                                >
                                                                    <Trash size={16}/>
                                                                </ActionIcon>)}

                                                        </Card>
                                                    )) :
                                                    (<Stack spacing="xs" mt="sm" bg="gray-300">
                                                        {modelServices.map((service, serviceIndex) =>
                                                                service.service_time_slots.map((d, index) => (
                                                                    <div key={`service-slot-${serviceIndex}-${index}`}
                                                                         className="flex flex-col gap-4">
                                                                        {d.time_slots.map((time, index) => (
                                                                            <div key={`${service.id}-${time.id}`}
                                                                                 className="flex items-center justify-evenly gap-2 border p-2">
                                                    <span className="flex items-center justify-evenly gap-4">
                                                      {`${index + 1}.`}
                                                    </span>
                                                                                <Group grow className="items-center gap-4">
                                                  <span>
                                                    <Text>Start Time</Text>
                                                    <Input
                                                        className="w-full"
                                                        placeholder="Start Time"
                                                        type="time"
                                                        value={time.start_time}
                                                        onChange={(event) => {
                                                            handleStartTimeChange(event.currentTarget.value);
                                                            updateTimeSlot(service.id, time.id, 'start_time', event.currentTarget.value);
                                                        }}
                                                    />

                                                  </span>
                                                                                    <span>
                                                        <Text>End Time</Text>
                                                        <Input
                                                            className="w-[128px]"
                                                            type="time"
                                                            value={time.end_time}
                                                            onChange={(event) => {
                                                                handleEndTimeChange(event.currentTarget.value);
                                                                updateTimeSlot(service.id, time.id, 'end_time', event.currentTarget.value);
                                                            }}
                                                        />
                                                          </span>
                                                                                </Group>

                                                                                <Select
                                                                                    label="Staff"
                                                                                    value={time.staff !== null ? time.staff?.toString() : ""}
                                                                                    data={[
                                                                                        {value: "", label: "None"},
                                                                                        ...(staffData?.result?.map((item: any) => ({
                                                                                            value: item.id?.toString() || "unknown_id",
                                                                                            label: item.user?.full_name || "Unknown Name",
                                                                                        })) || []),
                                                                                    ]}
                                                                                    placeholder="Select a Staff"
                                                                                    onChange={(selectedValue) =>
                                                                                        handelStaffDropdown(
                                                                                            selectedValue === "" ? null : selectedValue,
                                                                                            service.id,
                                                                                            time.id
                                                                                        )
                                                                                    }
                                                                                    dropdownPosition="bottom"
                                                                                    withinPortal
                                                                                    zIndex={1000}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ))
                                                        )}
                                                    </Stack>)}


                                            </Stack>)}

                                    </Stack>
                                </Card>
                            ))}
                        </Card>
                    ))
                    }

                    <Group position="right" mt="xl">
                        <Button variant="subtle" onClick={handleCloseModal}>Cancel</Button>
                        <Button
                            onClick={() => {
                                if (selectedSlotForEdit) {

                                    handleUpdateSlot(); // Update logic
                                } else {

                                    handleAddSlot(); // Create logic
                                }
                            }}

                            color="orange"
                        >
                            {selectedSlotForEdit ? "Update" : "Add Slots"}
                        </Button>

                    </Group>
                </Stack>
            </Modal>
        </div>)
}


export default Calendar;
