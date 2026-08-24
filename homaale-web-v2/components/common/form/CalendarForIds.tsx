import React, { useEffect, useState } from 'react';
import { IconArrowAutofitDown, IconArrowAutofitUp, IconCalendar, IconChevronLeft, IconChevronRight, IconMaximize, IconMinimize } from '@tabler/icons-react';
import { Box, Button, useMantineTheme } from "@mantine/core";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useDark } from "@/utils/helpers";
import { axiosClient } from "@/utils/axiosClient";
import urls from "@/constants/urls";
import { TbCircleFilled } from "react-icons/tb";
import { BookingModal } from '@/components/booking/BookingModal';
import type { BookingDataProps } from "@/types/booking/BookingDataProps";
import { EntityServiceDetailProps } from '@/types/EntityServiceDetailProps';
import { TaskBookDetailProps } from '@/types/booking/TaskBookDetailProps';
import { BookingProps } from '@/types/booking/BookingProps';
import { BookingPayload } from '@/types/booking/BookingPayload';
import { useMutation, useQuery } from "@tanstack/react-query";
import EntityServiceProfileCard from '@/components/cards/EntityServiceProfileCard';
import { Check } from 'lucide-react';
import { notifications } from "@mantine/notifications";
import { AvailableSlotProps } from "@/types/merchant/AvailableSlotProps";
import { BookingForm } from '@/components/booking/BookingForm';
import {boolean, string} from "yup";

export interface EntityData {
    id: string;
    date: string;
    merchant: string;
    is_active: boolean;
    service_time_slots: {
        id: number;
        entity_service: string;
        entity_service_title: string;
        time_slots: {
            id: number;
            start_time: string;
            end_time: string;
            status: string;
            seat_count: number;
            staff: number;
            staff_name: string;
        }[];
    }[];
}

dayjs.extend(utc);
dayjs.extend(timezone);

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
] as const;

const CALENDAR_GRID_SIZE = 42; // 6 rows * 7 days

const CalendarForIds = ({
                            id,
                            entity_user,
                            entityDetail,
                            bookingDetail,
                            boxDetail,
                            onClick,
                            onTimeSlotSelect,
                            is_requested,
                            disabled
                        }: {
    id: any,
    entity_user: any,
    bookingDetail?: TaskBookDetailProps,
    entityDetail?: EntityServiceDetailProps | null,
    is_requested?: boolean,
    boxDetail?: BookingProps["result"][0],
    onClick?: () => void,
    onTimeSlotSelect?: (selectedStartTimeSlot: string, selectedEndTimeSlot: string, selectedDate: string | null) => void,
    disabled?: boolean
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isZoomed, setIsZoomed] = useState(false);
    const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
    const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
    const [userSelectedDate, setUserSelectedDate] = useState<string | null>(null);
    const [selectedBookingDate, setselectedBookingDate] = useState<string>("");
    const [datas, setDatas] = useState<EntityData[]>([]);
    const [selectedStartTimeSlot, setSelectedStartTimeSlot] = useState<string>("");
    const [selectedEndTimeSlot, setSelectedEndTimeSlot] = useState<string>("");
    const [isModelOpen, SetIsModelOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableSlotsDataState, setAvailableSlotsDataState] = useState<AvailableSlotProps[]>([]);
    const [allSlotsData, setAllSlotsData] = useState<EntityData[]>([]);
    const [selectedAvailableDate, setSelectedAvailableDate] = useState<string | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [prevShowCalendar, setPrevShowCalendar] = useState(false);
    const dark = useDark();
    const theme = useMantineTheme();

    // Get today's date and current time in 'YYYY-MM-DD' and 'HH:mm' formats
    const today = dayjs().format('YYYY-MM-DD');
    const currentTime = dayjs().format('HH:mm');

    // Manage body overflow
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

    const fetchdata = async (merchant?: string, entity_service?: string, date?: string): Promise<AvailableSlotProps[]> => {
        try {
            setLoading(true);
            let url = `${urls.merchantSlots.slots}data/`;
            const params = new URLSearchParams();
            if (merchant) params.append("merchant", merchant);
            if (entity_service) params.append("entity", entity_service);
            if (date) params.append("date", date);
            if (params.toString()) url += `?${params.toString()}`;

            const { data: fetchedAvailableSlotData } = await axiosClient.get(`${url}`);

            if (fetchedAvailableSlotData && Array.isArray(fetchedAvailableSlotData)) {
                setDatas(fetchedAvailableSlotData);
                setAvailableSlotsDataState(fetchedAvailableSlotData);
                console.log("all the data", fetchedAvailableSlotData);
                return fetchedAvailableSlotData;
            } else {
                setError("API response did not return the expected Data Structure");
                return [];
            }
        } catch (error) {
            setError("Failed to fetch packages");
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Fetch slots for the entire current month
    const fetchMonthSlots = async () => {
        try {
            setLoading(true);
            const startOfMonth = dayjs(currentDate).startOf('month').format('YYYY-MM-DD');
            const endOfMonth = dayjs(currentDate).endOf('month').format('YYYY-MM-DD');
            const url = `${urls.merchantSlots.slots}data/?merchant=${entity_user}&entity=${id}&start_date=${startOfMonth}&end_date=${endOfMonth}`;
            const { data } = await axiosClient.get(url);
            if (Array.isArray(data)) {
                setDatas(data);
            } else {
                setError("Unexpected API response format");
            }
        } catch (err) {
            console.error("Error fetching month slots:", err);
            setError("Failed to fetch slots for the month");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthSlots(); // Fetch slots for the current month on mount or month change
    }, [currentDate, entity_user, id]);

    useEffect(() => {
        console.log("allSlotsData updated:", allSlotsData);
        setAllSlotsData(datas);
    }, [datas]);

    const getCurrentMonthDays = (date: Date) => {
        const daysInMonth = getDaysInMonth(date);
        return Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            isCurrentMonth: true,
            date: new Date(date.getFullYear(), date.getMonth(), i + 1)
        }));
    };

    const getNextMonthDays = (date: Date, currentMonthDays: number) => {
        const remainingDays = CALENDAR_GRID_SIZE - currentMonthDays;
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1);
        return Array.from({ length: remainingDays }, (_, i) => ({
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

    const handleDayClick = async (dayInfo: { date: Date; isCurrentMonth: boolean }) => {
        const formattedDate = dayjs(dayInfo.date).format('YYYY-MM-DD');
        // Disable past dates
        if (dayInfo.isCurrentMonth && formattedDate >= today) {
            const selectedDate = new Date(dayInfo.date);
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDateForFetch = `${year}-${month}-${day}`;

            const SelectedFormattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
            console.log("Selected date: ", SelectedFormattedDate);

            setHighlightedDate(SelectedFormattedDate);
            setSelectedSlotDate(selectedDate);
            setUserSelectedDate(formattedDateForFetch);
            setSelectedAvailableDate(formattedDate);

            // Fetch slots for the selected date
            await fetchdata(entity_user, id, formattedDateForFetch);
        }
    };

    const selectedDate = userSelectedDate || today;

    const handleZoomToggle = () => {
        setIsZoomed(!isZoomed);
    };

    // Check if a date has time slots (shown by default)
    const hasTimeSlots = (date: Date): boolean => {
        const formattedDate = dayjs(date).format('YYYY-MM-DD');
        return datas.some((data) => data.date === formattedDate && data.service_time_slots.length > 0);
    };

    // Calculate calendar days
    const prevMonthDays = getPreviousMonthDays(currentDate);
    const currentMonthDays = getCurrentMonthDays(currentDate);
    const nextMonthDays = getNextMonthDays(currentDate, prevMonthDays.length + currentMonthDays.length);
    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    const handleAvailableDateClick = (date: string) => {
        // Only allow selecting dates that are not in the past
        if (date >= today) {
            setSelectedAvailableDate(date);
        }
    };

    const {
        created_by: {
            full_name,
            badge,
            designation,
            profile_image,
            id: userId,
        } = {},
        budget_from,
        budget_to,
        budget_type,
    } = entityDetail ?? bookingDetail?.entity_service ?? boxDetail?.entity_service ?? ({} as EntityServiceDetailProps & TaskBookDetailProps);

    const handleTimeSlotSelect = (start_time: string, end_time: string, date: string) => {
        setSelectedStartTimeSlot(start_time);
        setSelectedEndTimeSlot(end_time);
        setselectedBookingDate(date);
        onTimeSlotSelect?.(start_time, end_time, date);
        console.log("Selected time slot in 12-hour format:", convertTo12Hour(start_time, end_time));
    };

    function convertTo12Hour(start_time: string, end_time: string) {
        const to12Hour = (time: string) => {
            try {
                const [hours, minutes] = time.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) {
                    throw new Error('Invalid time format');
                }
                const period = hours >= 12 ? 'PM' : 'AM';
                const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
                return minutes === 0 ? `${adjustedHours}${period}` : `${adjustedHours}:${minutes.toString().padStart(2, '0')}${period}`;
            } catch (error) {
                console.error(`Error converting time: ${time}`, error);
                return time; // Fallback to original time if conversion fails
            }
        };

        const start = to12Hour(start_time);
        const end = to12Hour(end_time);
        return `${start} - ${end}`;
    }

    const selectFirstAvailableSlot = (date: string) => {
        const merchantData = datas.find((data) => data.date === date);
        if (merchantData && merchantData.service_time_slots.length > 0) {
            const firstServiceSlot = merchantData.service_time_slots[0];
            const firstTimeSlot = firstServiceSlot.time_slots.find((slot) => slot.status === "available" && (date !== today || slot.start_time >= currentTime));
            if (firstTimeSlot) {
                handleTimeSlotSelect(firstTimeSlot.start_time, firstTimeSlot.end_time, date);
            }
        }
    };

    useEffect(() => {
        if (datas.length > 0 && !selectedAvailableDate) {
            const firstAvailableDate = datas
                .filter((data) => data.date >= today && data.service_time_slots.some(slot => slot.time_slots.length > 0))
                .sort((a, b) => a.date.localeCompare(b.date))[0]?.date;
            if (firstAvailableDate) {
                setSelectedAvailableDate(firstAvailableDate);
                setHighlightedDate(firstAvailableDate); // Sync with calendar highlight
            }
        }
    }, [datas, today]);

    const handleToggleCalendar = () => {
        setPrevShowCalendar(showCalendar); // Save the current state as previous
        setShowCalendar((prev) => !prev);
    };

    const getDefaultTimeSlots = () => {
        const defaultSlots = [];
        const currentDate = new Date();

        // Generate slots for 7 days starting from today
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + i);

            // Format date as YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            // Simple time slots structure
            const timeSlots = [
                { id: 1, start_time: "09:00", end_time: "11:00", status: "available", seat_count: 5, staff: 1, staff_name: "Default Staff" },
                { id: 2, start_time: "11:00", end_time: "13:00", status: "available", seat_count: 5, staff: 1, staff_name: "Default Staff" },
                { id: 3, start_time: "13:00", end_time: "15:00", status: "available", seat_count: 5, staff: 1, staff_name: "Default Staff" },
                { id: 4, start_time: "15:00", end_time: "17:00", status: "available", seat_count: 5, staff: 1, staff_name: "Default Staff" }
            ];

            defaultSlots.push({
                id: `default-${i}`,
                date: formattedDate,
                merchant: entity_user || "default-merchant",
                is_active: true,
                service_time_slots: [{
                    id: 1,
                    entity_service: id || "default-service",
                    entity_service_title: "Default Service",
                    time_slots: timeSlots
                }]
            });
        }
        return defaultSlots;
    };

    useEffect(() => {
        const hasValidSlots = datas.some((slot) => slot.date >= today);
        if (!datas.length || !hasValidSlots) {
            const defaultSlots = getDefaultTimeSlots();
            setDatas(defaultSlots);
        }
    }, [datas, today]);

    useEffect(() => {
        setSelectedStartTimeSlot("");
        setSelectedEndTimeSlot("");
        setselectedBookingDate("");
    }, [selectedAvailableDate]);

    return (
        <div className={`relative ${isZoomed ? 'h-screen w-full' : 'border-2'}`}>
            <div className={`${isZoomed ? 'fixed inset-0 z-20 flex items-center justify-center bg-white/90 dark:bg-gray-900/90' : ''}`}>
                <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg ${isZoomed ? 'w-11/12 max-w-5xl max-h-[90vh] overflow-auto' : 'w-full'}`}>
                    {isZoomed && (
                        <button
                            className="absolute top-4 right-4 z-30 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={handleZoomToggle}
                        >
                            <IconMinimize className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                        </button>
                    )}

                    <div className="p-6" style={{ background: dark ? theme.colors.dark[6] : "#fff", color: dark ? theme.white : theme.black }}>
                        {/* Year Navigation */}
                        {showCalendar && (
                            <div>
                                <div className="flex flex-wrap items-center w-full overflow-hidden mb-6">
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => navigateYear('prev')}
                                                className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                                aria-label="Previous year"
                                            >
                                                <IconChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                                            </button>
                                            <span className="text-base md:text-xl font-medium text-gray-500 dark:text-gray-200">
                                                {currentDate.getFullYear()}
                                            </span>
                                            <button
                                                onClick={() => navigateYear('next')}
                                                className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                                aria-label="Next year"
                                            >
                                                <IconChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 flex-grow min-w-0">
                                        <button
                                            onClick={() => navigateMonth('prev')}
                                            className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                            aria-label="Previous month"
                                        >
                                            <IconChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                                        </button>
                                        <span className="text-base md:text-xl font-medium text-gray-500 dark:text-gray-200">
                                            {MONTHS[currentDate.getMonth()]}
                                        </span>
                                        <button
                                            onClick={() => navigateMonth('next')}
                                            className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                            aria-label="Next month"
                                        >
                                            <IconChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                                        </button>
                                    </div>

                                    {!isZoomed && (
                                        <button
                                            className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
                                            onClick={handleZoomToggle}
                                            aria-label="Maximize"
                                        >
                                            <IconMaximize className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                                        </button>
                                    )}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-2 mb-2">
                                    {DAYS_IN_WEEK.map(day => (
                                        <div key={day} className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-2 border-b-2 border-gray-200 dark:border-gray-700 pb-4">
                                    {allDays.map((dayInfo, index) => {
                                        const formattedDate = dayjs(dayInfo.date).format('YYYY-MM-DD');
                                        const isToday = formattedDate === today;
                                        const isSelected = formattedDate === highlightedDate;
                                        const hasSlots = hasTimeSlots(dayInfo.date);
                                        const isPast = formattedDate < today;

                                        return (
                                            <div key={`${dayInfo.day}-${index}`} className="relative">
                                                <button
                                                    className={`
                                                        w-full h-12 flex items-center justify-center rounded-lg
                                                        ${dayInfo.isCurrentMonth ? (dark ? 'text-gray-100' : 'text-black') : 'text-gray-400 dark:text-gray-600'}
                                                        ${isSelected ? 'bg-orange-300 dark:bg-orange-400 text-white font-bold' : ''}
                                                        ${isToday && !isSelected ? 'bg-gray-300 dark:bg-gray-500' : ''}
                                                        ${isPast ? 'opacity-50 cursor-not-allowed' : !isSelected && dayInfo.isCurrentMonth ? 'hover:bg-orange-200 hover:text-gray-900 dark:hover:bg-orange-300' : ''}
                                                        ${!dayInfo.isCurrentMonth && 'cursor-default opacity-50'}
                                                        transition-colors
                                                    `}
                                                    onClick={() => {
                                                        if (dayInfo.isCurrentMonth && !isPast) {
                                                            handleDayClick(dayInfo);
                                                        }
                                                    }}
                                                    disabled={isPast}
                                                >
                                                    <span className="flex items-center gap-1">
                                                        {dayInfo.day}
                                                        {hasSlots && dayInfo.isCurrentMonth && <span className="text-red-500">*</span>}
                                                    </span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap justify-start items-center gap-4 mt-4 mb-4">
                            <Button onClick={handleToggleCalendar}><IconCalendar />{` ${!showCalendar ? `Show Calendar` : 'Hide Calendar'} `}</Button>
                        </div>

                        {/* Always Show Available Slot Dates */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                {!is_requested && "Select Date"}
                            </h3>
                            {is_requested ? (
                                <div className="p-4 text-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <p className="text-gray-600 dark:text-gray-400">{is_requested ? " " : "No Time Slots Available"}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                        {is_requested ? "" : "Try selecting a different date"}
                                    </p>
                                </div>
                            ) : Array.isArray(datas) && datas.length > 0 && !is_requested && (
                                <>
                                    {/* Show Available Dates */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {datas
                                            .filter((merchantData: EntityData) => merchantData.date >= today)
                                            .map((merchantData: EntityData, index: number) => {
                                                const formattedDate = dayjs(merchantData.date).format('ddd, MMM D');
                                                const isSelected = selectedAvailableDate === merchantData.date;
                                                const isPast = merchantData.date < today;

                                                return (
                                                    <button
                                                    style={{
                                                        background:isSelected?theme.colors.brand[4]:"",
                                                       


                                                        
                                                    }}
                                                        key={index}
                                                        className={`
                                                            px-1 py-2 border-2 rounded-lg w-28
                                                            ${isSelected ? "bg-orange-400 text-white" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"}
                                                            ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray dark:hover:bg-gray-700'}
                                                            transition-colors
                                                        `}
                                                        onClick={() => handleAvailableDateClick(merchantData.date)}
                                                        disabled={isPast}
                                                    >
                                                        {formattedDate}
                                                    </button>
                                                );
                                            })}
                                    </div>

                                    {/* Show Time Slots for Selected Date */}
                                    {selectedAvailableDate && selectedAvailableDate >= today && (
                                        <>
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                Choose a time period
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                Team will arrive within the selected time
                                            </p>
                                            {datas
                                                .filter((merchantData) => merchantData.date === selectedAvailableDate)
                                                .map((merchantData: EntityData, index: number) => (
                                                    <div key={index} className="mb-6">
                                                        <div className="flex flex-wrap gap-3">
                                                            {Array.isArray(merchantData?.service_time_slots) &&
                                                                merchantData?.service_time_slots?.map((serviceSlot) => (
                                                                    <div key={serviceSlot.id} className="w-full">
                                                                        <div className="flex flex-wrap gap-3">
                                                                            {Array.isArray(serviceSlot?.time_slots) &&
                                                                                serviceSlot?.time_slots?.map((timeSlot, timeSlotIndex) => {
                                                                                    const getStatusColor = (status: string) => {
                                                                                        switch (status) {
                                                                                            case "available":
                                                                                                return {
                                                                                                    border: "border-gray-300 dark:border-gray-600",
                                                                                                    text: "text-gray-800 dark:text-gray-200",
                                                                                                    hover: "hover:bg-gray- dark:hover:bg-gray-700",
                                                                                                };
                                                                                            case "fast_filling":
                                                                                                return {
                                                                                                    border: "",
                                                                                                    text: " dark:text-blue-400",
                                                                                                    hover: "hover:bg- dark:hover:bg-blue-900",
                                                                                                };
                                                                                            case "booked":
                                                                                                return {
                                                                                                    border: "border-red-300 dark:border-red-600",
                                                                                                    text: "text-red-600 dark:text-red-400 opacity-50 cursor-not-allowed",
                                                                                                    hover: "",
                                                                                                };
                                                                                            default:
                                                                                                return {
                                                                                                    border: "border-gray-300 dark:border-gray-600",
                                                                                                    text: "text-gray-800 dark:text-gray-200",
                                                                                                    hover: "hover:bg-gray- dark:hover:bg-gray-700",
                                                                                                };
                                                                                        }
                                                                                    };

                                                                                    const colors = getStatusColor(timeSlot.status);
                                                                                    const isSelected = selectedStartTimeSlot === timeSlot.start_time && selectedEndTimeSlot === timeSlot.end_time;
                                                                                    const isPastTime = merchantData.date === today && timeSlot.start_time < currentTime;

                                                                                    return (
                                                                                        <button
                                                                                        style={{
                                                                                            background:isSelected?theme.colors.brand[4]:""
                                                                                        }}
                                                                                            key={timeSlotIndex}
                                                                                            className={`
                                                                                                px-4 py-2 border-2 rounded-lg w-40
                                                                                                ${colors.border} ${colors.text} ${colors.hover}
                                                                                                ${isSelected ? "bg-orange-400 text-white " : "bg-white dark:bg-gray-800"}
                                                                                                ${timeSlot.status === "booked" || isPastTime ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                                                                                transition-colors
                                                                                            `}
                                                                                            onClick={() => {
                                                                                                if (timeSlot.status !== "booked" && !isPastTime) {
                                                                                                    handleTimeSlotSelect(timeSlot.start_time, timeSlot.end_time, merchantData.date);
                                                                                                }
                                                                                            }}
                                                                                            disabled={timeSlot.status === "booked" || isPastTime}
                                                                                        >
                                                                                            <span>{convertTo12Hour(timeSlot.start_time, timeSlot.end_time)}</span>
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarForIds;
