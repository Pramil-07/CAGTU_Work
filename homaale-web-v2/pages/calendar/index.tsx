"use client";

import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import {
    createViewDay,
    createViewWeek,
    createViewMonthGrid,
    createViewMonthAgenda,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css";
import { useEffect, useState } from "react";
import { axiosClient } from "@/utils/axiosClient";
import { useUser } from "@/hooks/useUser";
import urls from "@/constants/urls";
import {
    Box,
    Button,
    Flex,
    Select,
    Text,
    Loader,
    Group,
    ScrollArea,
} from "@mantine/core";
import Calendarcard from "@/components/cards/Calendarcard";
import Layout from "@/components/Layout/Layout";
import { CalendarEventInteractive } from "@/components/event/CalendarEventInteractive";
import { EventCard } from "@/components/cards/EventCard";
import { useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { isLoggedIn, useDark } from "@/utils/helpers";
import { toast } from "@/components/common/Toast";
import { CalendarEventExternal } from "@schedule-x/calendar";
import NoDataAlert from "@/components/common/NoDataAlert";
import Link from "next/link";
import { ExpandButton } from "@/components/common/ExpandButton";
import {
    IconCalendar,
    IconCalendarEvent,
    IconUsers,
} from "@tabler/icons-react";
import Breadcrumb from "@/components/common/BreadCrumb";

export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    full_name: string;
    designation: string;
    bio: string;
    created_at: string;
    profile_image: string | null;
    phone: string | null;
    is_profile_verified: boolean;
    is_followed: boolean;
    is_following: boolean;
    badge: null | object;
}

export interface Currency {
    code: string;
    name: string;
    symbol: string;
}

export interface Image {
    id: number;
    name: string;
    size: string;
    media_type: string;
    media: string;
}

export interface EntityService {
    id: string;
    budget_type: string;
    budget_from: string;
    budget_to: string;
    created_by: User;
    highlights: string[];
    images: Image[];
    is_requested: boolean;
    location: string;
    videos: any[];
}

export interface Bookings {
    id: string;
    title: string;
    description: string;
    price: string;
    earning: string;
    currency: Currency;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    status: string;
    is_active: boolean;
    is_paid: boolean;
    is_rated: boolean;
    created_at: string;
    updated_at: string;
    assignee: User;
    assigner: User;
    entity_service: EntityService;
    booking: number;
    cancellation_description: string;
    cancellation_reason: string;
    cancelled_by: null | User;
    completed_on: null | string;
    approved_by: string;
    estimated_time: number;
    extra_data: any[];
}

interface Service {
    id: string;
    title: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    city: { name: string };
    payable_from: string;
    currency: { symbol: string };
    images: string[];
    booked_count: number;
    budget_from: string;
    budget_to: string;
    budget_type: string;
    created_at: string;
    created_by: {
        id: string;
        username: string;
        email: string;
        phone: string | null;
        full_name: string;
        profile_image: string;
    };
    is_bookmarked: boolean;
    is_endorsed: boolean;
    is_online: boolean;
    is_range: boolean;
    is_requested: boolean;
    location: string | null;
    owner: {
        id: string;
        username: string;
        email: string;
        phone: string | null;
        full_name: string;
    };
    rating: number;
    rating_count: number;
    service: {
        id: string;
        title: string;
        is_active: boolean;
        is_verified: boolean;
    };
    slug: string;
    videos: string[];
}

interface SimpleCalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    calendarId?: string;
    visibility?: "public" | "private";
    userId?: string;
    description?: string;
}

interface LegacyCalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    calendarId?: string;
    visibility: "public" | "private";
    userId: string;
    description: string;
}

export enum EventType {
    Personal = "personal",
    Festival = "festival",
    Holiday = "holiday",
    Reminder = "reminder",
    Meeting = "meeting",
    Appointment = "appointment",
    Travel = "travel",
    Weekend = "weekend",
    Event = "event",
}

export enum RepeatChoice {
    None = "none",
    Daily = "daily",
    Weekly = "weekly",
    Monthly = "monthly",
    Yearly = "yearly",
    Custom = "custom",
}

export interface EventTimeSlot {
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    date: string;
    start_time: string;
    end_time: string;
}

export interface CalendarEvent {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    event_type: EventType;
    repeat: RepeatChoice;
    color_tag: string;
    visibility: boolean;
    location: string;
    user: string;
    event_time_slots: EventTimeSlot[];
    calendarId?: string;
    created_by?: string;
    next_occurence?: {
        start_date: string;
        end_date: string;
    };
}

const formatDateTime = (date: string, time: string | null): string => {
    if (!date || !time) {
        return `${date || "1970-01-01"} ${time || "00:00"}`;
    }
    const [hours, minutes] = time.split(":").slice(0, 2);
    return `${date} ${hours}:${minutes}`;
};

function CalendarApp() {
    const [services, setServices] = useState<Service[]>([]);
    const [tasks, setTasks] = useState<Service[]>([]);
    const [myBookings, setMyBookings] = useState<Bookings[]>([]);
    const [othersBookings, setOthersBookings] = useState<Bookings[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
    const [open, setOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
    const user = useUser();
    const is_dark = useDark();
    const [dark, setDark] = useState(is_dark);
    const id = user.data?.id;
    const [viewMode, setViewMode] = useState<
        "services" | "tasks" | "bookings" | "Events"
    >("bookings");
    const [activeSection, setActiveSection] = useState<number>(1);
    const isMobile = useMediaQuery("(max-width:480px)");
    useEffect(() => {
        setDark(is_dark);
    }, [is_dark]);

    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const mediaQuery = useMediaQuery("(max-width: 1000px)", false);

    useEffect(() => {
        setIsSmallScreen(mediaQuery);
    }, [mediaQuery]);

    const fetchTasks = async (retries = 3): Promise<Service[]> => {
        setIsLoadingTasks(true);
        try {
            const response = await axiosClient.get<{ result: Service[] }>(
                `${urls.entity.task}&created_by=${id}`
            );
            const services = response.data.result || [];
            setTasks(services);
            console.log("Fetched services:", services);
            return services; // Return Service[] for the caller
        } catch (error) {
            console.error("Error fetching services:", error);
            if (retries > 0) {
                console.log(
                    `Retrying fetchTasks (${retries} attempts left)...`
                );
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
                return fetchTasks(retries - 1); // Recursive call returns Promise<Service[]>
            }
            setTasks([]);
            // toast({ message: "Failed to fetch services after retries", type: "error" });
            return []; // Return empty array on failure
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const fetchServices = async (retries = 3): Promise<Service[]> => {
        setIsLoadingServices(true);
        try {
            const response = await axiosClient.get<{ result: Service[] }>(
                `${urls.entity.service}&created_by=${id}`
            );
            const services = response.data.result || [];
            setServices(services);
            console.log("Fetched services:", services);
            return services; // Explicitly return Service[]
        } catch (error) {
            console.error("Error fetching services:", error);
            if (retries > 0) {
                console.log(
                    `Retrying fetchServices (${retries} attempts left)...`
                );
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
                return fetchServices(retries - 1); // Recursive call returns Promise<Service[]>
            }
            setServices([]);
            // toast({ message: "Failed to fetch services after retries", type: "error" });
            return []; // Explicitly return empty array
        } finally {
            setIsLoadingServices(false);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const response = await axiosClient.get(
                `${urls.booking.new_task}?assigned_to_me=true`
            );
            setMyBookings(response.data.result || []);
            console.log("Fetched my bookings:", response.data.result);
        } catch (error) {
            console.error("Error fetching my bookings:", error);
            setMyBookings([]);
            // toast({ message: "Failed to fetch my bookings", type: "error" });
        }
    };

    const fetchOthersBookings = async () => {
        try {
            const response = await axiosClient.get(
                `${urls.booking.new_task}?assigned_to_me=false`
            );
            setOthersBookings(response.data.result || []);
            console.log("Fetched others' bookings:", response.data.result);
        } catch (error) {
            console.error("Error fetching others' bookings:", error);
            setOthersBookings([]);
            // toast({ message: "Failed to fetch others' bookings", type: "error" });
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await axiosClient.get(`memo/`);
            setCustomEvents(response.data);
            console.log("Fetched requested tasks:", response.data);
        } catch (error) {
            console.error("Error fetching booking task data:", error);
            setCustomEvents([]);
        }
    };

    useEffect(() => {
        if (!viewMode) return;

        switch (viewMode) {
            case "tasks":
                fetchTasks();
                break;

            case "services":
                fetchServices();
                break;

            case "bookings":
                fetchMyBookings();
                break;

            case "Events":
                fetchEvents();
                break;

            default:
                break;
        }
    }, [viewMode]);

    useEffect(() => {
        if (activeSection === 1) {
            fetchMyBookings();
        } else if (activeSection === 2) {
            fetchOthersBookings();
        }
    }, [activeSection]);

    const calendarEvents = tasks.map((service) => ({
        id: service.id,
        title: service.title,
        start: formatDateTime(service.start_date, service.start_time),
        end: formatDateTime(service.end_date, service.end_time),
        calendarId: "tasks",
    })) as SimpleCalendarEvent[];

    const myBookingEvents = myBookings.map((booking) => ({
        id: booking.id,
        title: booking.title,
        start: formatDateTime(booking.start_date, booking.start_time),
        end: formatDateTime(booking.end_date, booking.end_time),
        calendarId: "booking",
    }));

    const othersBookingEvents = othersBookings.map((booking) => ({
        id: booking.id,
        title: booking.title,
        start: formatDateTime(booking.start_date, booking.start_time),
        end: formatDateTime(booking.end_date, booking.end_time),
        calendarId: "booking",
    }));

    const serviceEvents = services.map((service) => ({
        id: service.id,
        title: service.title,
        start: formatDateTime(service.start_date, service.start_time),
        end: formatDateTime(service.end_date, service.end_time),
        calendarId: "services",
    })) as SimpleCalendarEvent[];

    const formattedCustomEvents = customEvents
        .map((event, index) => {
            if (!event.id) {
                console.warn(
                    `Skipping invalid event at index ${index}: missing or invalid id`,
                    event
                );
                return null;
            }
            return {
                id: event.id.toString(),
                title: event.title,
                start: formatDateTime(
                    event.event_time_slots[0]?.date || event.start_date,
                    event.event_time_slots[0]?.start_time
                ),
                end: formatDateTime(
                    event.end_date,
                    event.event_time_slots[0]?.end_time
                ),
                calendarId: "custom",
                visibility: event.visibility ? "public" : "private",
                userId: event.user,
                description: event.description,
            } as SimpleCalendarEvent;
        })
        .filter((event): event is SimpleCalendarEvent => event !== null);

    let allEvents: SimpleCalendarEvent[] = [];
    if (viewMode === "services") {
        allEvents = [...serviceEvents];
    } else if (viewMode === "tasks") {
        allEvents = [...calendarEvents];
    } else if (viewMode === "bookings") {
        if (activeSection === 1) {
            allEvents = [...myBookingEvents];
        } else if (activeSection === 2) {
            allEvents = [...othersBookingEvents];
        } else {
            allEvents = [];
        }
    } else if (viewMode === "Events") {
        allEvents = [...formattedCustomEvents];
    }

    const calendar = useNextCalendarApp({
        views: [
            createViewMonthGrid(),
            createViewDay(),
            createViewWeek(),
            createViewMonthAgenda(),
        ],
        defaultView: "monthgrid",
        // isResponsive:false,
        events: allEvents,
        calendars: {
            tasks: {
                colorName: "tasks",
                lightColors: {
                    main: "#4299e1",
                    container: "#b3dffa",
                    onContainer: "#1a4971",
                },
                darkColors: {
                    main: "#7dc3fc",
                    container: "#2c5282",
                    onContainer: "#dbeafe",
                },
            },
            bookings: {
                colorName: "booking",
                lightColors: {
                    main: "#ec4899",
                    container: "#fce7f3",
                    onContainer: "#9d174d",
                },
                darkColors: {
                    main: "#f472b6",
                    container: "#be185d",
                    onContainer: "#fff1f2",
                },
            },
            services: {
                colorName: "services",
                lightColors: {
                    main: "#f59e0b",
                    container: "#fef3c7",
                    onContainer: "#92400e",
                },
                darkColors: {
                    main: "#fbbf24",
                    container: "#b45309",
                    onContainer: "#fef9c3",
                },
            },
            custom: {
                colorName: "custom",
                lightColors: {
                    main: "#10b981",
                    container: "#d1fae5",
                    onContainer: "#065f46",
                },
                darkColors: {
                    main: "#34d399",
                    container: "#047857",
                    onContainer: "#ecfdf5",
                },
            },
        },
        plugins: [eventsService, createEventModalPlugin()],
        callbacks: {
            onRender: () => {
                console.log("Calendar rendered", allEvents);
                eventsService.set(allEvents);
            },
            onClickDate: (date: string) => {
                setSelectedDate(date);
                setEventToEdit(null);
                setOpen(true);
            },
            onEventClick: (event: CalendarEventExternal, _e: UIEvent) => {
                const eventId = event.id.toString();
                const customEvent = customEvents.find(
                    (e) => e.id.toString() === eventId
                );
                if (customEvent) {
                    setEventToEdit(customEvent);
                    setOpen(true);
                }
            },
        },
        isDark: dark,
    });

    useEffect(() => {
        calendar?.events.set(allEvents);
    }, [
        customEvents,
        tasks,
        myBookings,
        othersBookings,
        services,
        viewMode,
        activeSection,
    ]);

    const handleEventAdded = (newEvent: CalendarEvent) => {
        const updatedEvent = { ...newEvent, calendarId: "custom" };
        setCustomEvents((prev) => [...prev, updatedEvent]);
        localStorage.setItem(
            "calendarEvents",
            JSON.stringify([...customEvents, updatedEvent])
        );
        calendar?.events.set([
            ...allEvents,
            {
                id: newEvent.id.toString(),
                title: newEvent.title,
                start: formatDateTime(
                    newEvent.event_time_slots[0]?.date || newEvent.start_date,
                    newEvent.event_time_slots[0]?.start_time
                ),
                end: formatDateTime(
                    newEvent.event_time_slots[0]?.date || newEvent.end_date,
                    newEvent.event_time_slots[0]?.end_time
                ),
                calendarId: "custom",
                visibility: newEvent.visibility ? "public" : "private",
                userId: newEvent.user,
                description: newEvent.description,
            },
        ]);
    };

    const handleEventUpdated = (updatedEvent: CalendarEvent) => {
        console.log("Updating event:", updatedEvent);
        const updatedEvents = customEvents.map((event) =>
            event.id === updatedEvent.id
                ? { ...updatedEvent, calendarId: "custom" }
                : event
        );
        console.log("Updated events array:", updatedEvents);
        setCustomEvents(updatedEvents);
        localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents));
        calendar?.events.set([
            ...allEvents,
            ...updatedEvents.map((event) => ({
                id: event.id.toString(),
                title: event.title,
                start: formatDateTime(
                    event.event_time_slots[0]?.date || event.start_date,
                    event.event_time_slots[0]?.start_time
                ),
                end: formatDateTime(
                    event.event_time_slots[0]?.date || event.end_date,
                    event.event_time_slots[0]?.end_time
                ),
                calendarId: "custom",
                visibility: event.visibility ? "public" : "private",
                userId: event.user,
                description: event.description,
            })),
        ]);
        console.log("Event updated:", updatedEvent.id);
    };

    const handleEventDeleted = async (eventId: number) => {
        const eventToDelete = customEvents.find(
            (event) => event.id === eventId
        );
        if (!eventToDelete) return;

        modals.openConfirmModal({
            title: "Delete Event",
            children: (
                <Text size="sm">
                    Are you sure you want to delete this event? This action
                    cannot be undone.
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onCancel: () => console.log("Deletion canceled"),
            onConfirm: async () => {
                try {
                    // Make DELETE request to the API
                    const response = await axiosClient.delete(
                        `/memo/${eventId}`,
                        {}
                    );

                    if (!response) {
                        throw new Error("Failed to delete event");
                    }

                    // Update local state after successful deletion
                    const updatedEvents = customEvents.filter(
                        (event) => event.id !== eventId
                    );
                    setCustomEvents(updatedEvents);
                    calendar?.events.set([
                        ...allEvents,
                        ...updatedEvents.map((event) => ({
                            id: event.id.toString(),
                            title: event.title,
                            start: formatDateTime(
                                event.event_time_slots[0]?.date ||
                                    event.start_date,
                                event.event_time_slots[0]?.start_time
                            ),
                            end: formatDateTime(
                                event.event_time_slots[0]?.date ||
                                    event.end_date,
                                event.event_time_slots[0]?.end_time
                            ),
                            calendarId: "custom",
                            visibility: event.visibility ? "public" : "private",
                            userId: event.user,
                            description: event.description,
                        })),
                    ]);
                    toast.success("event deleted sucessfully");
                    console.log("Event deleted:", eventId);
                } catch (error) {
                    console.error("Error deleting event:", error);
                    // Optionally, show an error notification to the user
                    // e.g., notifications.show({ title: 'Error', message: 'Failed to delete event', color: 'red' });
                }
            },
        });
    };

    const handleEditClick = (event: CalendarEvent) => {
        setEventToEdit(event);
        setOpen(true);
    };
    const handleEventAddButton = () => {
        setOpen(true);
    };

    return (
        <Layout
            currentTitle="calendar"
            description="Calendar"
            hideBreadCrumbs={true}
        >
            <div
                className={`flex ${
                    isSmallScreen ? "flex-col" : "flex-row"
                } gap-2.5 w-full justify-between items-start `}
            >
                <div
                    className="p-2.5 border-2 border-gray-400 rounded-lg box-content  flex-1"
                    style={{
                        width: isSmallScreen ? "100%" : "auto",
                    }}
                >
                    <Flex align="center" justify="space-between" mb="lg">
                        <h1>Calendar</h1>
                        <Select
                            label="View"
                            value={viewMode}
                            onChange={(value) =>
                                setViewMode(
                                    value as
                                        | "services"
                                        | "tasks"
                                        | "bookings"
                                        | "Events"
                                )
                            }
                            data={[
                                { value: "services", label: "Services List" },
                                { value: "tasks", label: "Tasks List" },
                                {
                                    value: "bookings",
                                    label: "My bookings List",
                                },
                                { value: "Events", label: "Event list" },
                            ]}
                            className="w-48"
                        />
                    </Flex>
                    <div style={{ paddingBottom: "10px" }}>
                        <Breadcrumb currentTitle={"Calendar"} />
                    </div>
                    <div
                        className={dark ? "is-dark" : ""}
                        style={{
                            width: isSmallScreen ? "100%" : "auto",
                            height: isSmallScreen ? "auto" : "auto",
                            overflow: "auto",
                            minHeight: isSmallScreen ? "400px" : "auto",
                        }}
                    >
                        <ScheduleXCalendar calendarApp={calendar} />
                    </div>
                    {isLoggedIn() ? (
                        <CalendarEventInteractive
                            selectedDate={selectedDate}
                            opened={open}
                            setOpened={setOpen}
                            onEventAdded={handleEventAdded}
                            onEventDeleted={handleEventDeleted}
                            onEventUpdated={handleEventUpdated}
                            event={eventToEdit}
                            currentUserId={id ?? ""}
                        />
                    ) : (
                        <Text>you need to login</Text>
                    )}
                    <Group>
                        <Flex gap={10}>
                            <Box
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "#fff",
                                    padding: "8px 12px",
                                    borderRadius: 6,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    transition: "transform 0.2s",
                                }}
                            >
                                <span
                                    style={{
                                        background: "#10b981",
                                        color: "#fff",
                                        padding: "4px 8px",
                                        borderRadius: 4,
                                        fontSize: 13,
                                        marginRight: 8,
                                    }}
                                ></span>
                                <span
                                    style={{ fontSize: 14, color: "#1f2937" }}
                                >
                                    Events
                                </span>
                            </Box>
                            <Box
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "#fff",
                                    padding: "8px 12px",
                                    borderRadius: 6,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    transition: "transform 0.2s",
                                }}
                            >
                                <span
                                    style={{
                                        background: "#c084fc",
                                        color: "#fff",
                                        padding: "4px 8px",
                                        borderRadius: 4,
                                        fontSize: 13,
                                        marginRight: 8,
                                    }}
                                ></span>
                                <span
                                    style={{ fontSize: 14, color: "#1f2937" }}
                                >
                                    Bookings
                                </span>
                            </Box>
                            <Box
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "#fff",
                                    padding: "8px 12px",
                                    borderRadius: 6,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    transition: "transform 0.2s",
                                }}
                            >
                                <span
                                    style={{
                                        background: "#4299e1",
                                        color: "#fff",
                                        padding: "4px 8px",
                                        borderRadius: 4,
                                        fontSize: 13,
                                        marginRight: 8,
                                    }}
                                ></span>
                                <span
                                    style={{ fontSize: 14, color: "#1f2937" }}
                                >
                                    Tasks
                                </span>
                            </Box>
                        </Flex>
                    </Group>
                </div>

                <div
                    className={`${isSmallScreen ? "w-full" : "w-2/5"} ${
                        isSmallScreen ? "h-auto" : "h-[800px]"
                    } overflow-auto min-h-[400px]`}
                >
                    {viewMode === "services" ? (
                        <ScrollArea h={650}>
                            <Text size="lg" fw={700} mb="md">
                                Services List
                            </Text>
                            {isLoadingServices ? (
                                <Flex justify="center" align="center" mt="lg">
                                    <Loader />
                                </Flex>
                            ) : services.length > 0 ? (
                                services.map((service) => (
                                    <Link
                                        href={`/services/${service.id}`}
                                        key={service.id}
                                    >
                                        <Calendarcard
                                            id={service.id}
                                            title={service.title}
                                            profile={
                                                service.created_by.profile_image
                                            }
                                            location={service.city.name}
                                            start_time={service.start_time}
                                            assignee={
                                                service.created_by.full_name
                                            }
                                            end_time={service.end_time}
                                            start_date={service.start_date}
                                            price={service.payable_from}
                                            is_requested={false}
                                            currency={service.currency.symbol}
                                            priceType={service.budget_type}
                                            end_date={service.end_date}
                                        />
                                    </Link>
                                ))
                            ) : (
                                <Text>
                                    <NoDataAlert />
                                </Text>
                            )}
                        </ScrollArea>
                    ) : viewMode === "bookings" ? (
                        <>
                            <Flex
                                justify="flex-end"
                                mb="md"
                                gap="sm"
                                wrap={isSmallScreen ? "wrap" : "nowrap"}
                            >
                                <ExpandButton
                                    icon={<IconCalendar size={20} />}
                                    title="Other's Bookings"
                                    id={1}
                                    activeId={activeSection}
                                    setActiveId={setActiveSection}
                                    // is_expandable={true}
                                />
                                <ExpandButton
                                    icon={<IconUsers size={20} />}
                                    title="My Bookings"
                                    id={2}
                                    activeId={activeSection}
                                    setActiveId={setActiveSection}
                                    // is_expandable={true}
                                />
                            </Flex>
                            {activeSection === 1 && (
                                <ScrollArea h={650}>
                                    <Text size="lg" fw={700} mb="md">
                                        Other Bookings List
                                    </Text>
                                    {myBookings.length > 0 ? (
                                        myBookings.map((booking) => (
                                            <Link
                                                href={`/bookings/?active_tab=booking`}
                                                key={booking.id}
                                            >
                                                <Calendarcard
                                                    id={booking.id}
                                                    title={booking.title}
                                                    profile={
                                                        booking.entity_service
                                                            .created_by
                                                            .profile_image
                                                    }
                                                    location={
                                                        booking.entity_service
                                                            .location
                                                    }
                                                    start_time={
                                                        booking.start_time
                                                    }
                                                    assignee={
                                                        booking?.assignee
                                                            ?.full_name
                                                    }
                                                    end_time={booking.end_time}
                                                    start_date={
                                                        booking.start_date
                                                    }
                                                    price={booking.price}
                                                    is_requested={
                                                        booking.entity_service
                                                            .is_requested
                                                    }
                                                    currency={
                                                        booking.currency.symbol
                                                    }
                                                    priceType={
                                                        booking.entity_service
                                                            .budget_type
                                                    }
                                                    end_date={booking.end_date}
                                                />
                                            </Link>
                                        ))
                                    ) : (
                                        <Text>
                                            <NoDataAlert />
                                        </Text>
                                    )}
                                </ScrollArea>
                            )}
                            {activeSection === 2 && (
                                <ScrollArea h={650}>
                                    <Text size="lg" fw={700} mb="md">
                                        My Bookings List
                                    </Text>
                                    {othersBookings.length > 0 ? (
                                        othersBookings.map((booking) => (
                                            <Link
                                                href={`/bookings?active_tab=mybookings`}
                                                key={booking.id}
                                            >
                                                <Calendarcard
                                                    id={booking.id}
                                                    title={booking.title}
                                                    profile={
                                                        booking.entity_service
                                                            .created_by
                                                            .profile_image
                                                    }
                                                    location={
                                                        booking.entity_service
                                                            .location
                                                    }
                                                    assignee={
                                                        booking?.assignee
                                                            ?.first_name
                                                    }
                                                    start_time={
                                                        booking.start_time
                                                    }
                                                    end_time={booking.end_time}
                                                    start_date={
                                                        booking.start_date
                                                    }
                                                    price={booking.price}
                                                    is_requested={
                                                        booking.entity_service
                                                            .is_requested
                                                    }
                                                    currency={
                                                        booking.currency.symbol
                                                    }
                                                    priceType={
                                                        booking.entity_service
                                                            .budget_type
                                                    }
                                                    end_date={booking.end_date}
                                                />
                                            </Link>
                                        ))
                                    ) : (
                                        <Text>
                                            <Loader />
                                        </Text>
                                    )}
                                </ScrollArea>
                            )}
                        </>
                    ) : viewMode === "tasks" ? (
                        <ScrollArea h={650}>
                            <Flex>
                                <Text size="lg" fw={700} mb="md">
                                    Tasks List
                                </Text>
                            </Flex>
                            {isLoadingTasks ? (
                                <Flex justify="center" align="center" mt="lg">
                                    <Loader />
                                </Flex>
                            ) : tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <Link
                                        href={`/tasks/${task.id}`}
                                        key={task.id}
                                    >
                                        <Calendarcard
                                            id={task.id}
                                            title={task.title}
                                            profile={
                                                task.created_by.profile_image
                                            }
                                            location={task.city.name}
                                            start_time={task.start_time}
                                            end_time={task.end_time}
                                            start_date={task.start_date}
                                            assignee={task.created_by.full_name}
                                            price={task.payable_from}
                                            is_requested={true}
                                            currency={task.currency.symbol}
                                            priceType={task.budget_type}
                                            end_date={task.end_date}
                                        />
                                    </Link>
                                ))
                            ) : (
                                <Text>
                                    {" "}
                                    <Loader />
                                </Text>
                            )}
                        </ScrollArea>
                    ) : (
                        viewMode === "Events" && (
                            <>
                                <Flex>
                                    <Text size="lg" fw={700} mb="md">
                                        Event Lists
                                    </Text>
                                    {isLoggedIn() && (
                                        <Button onClick={handleEventAddButton}>
                                            +{<IconCalendarEvent />}
                                        </Button>
                                    )}
                                </Flex>
                                {customEvents.length > 0 ? (
                                    customEvents.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            handleDelete={() =>
                                                handleEventDeleted(event.id)
                                            }
                                            profileId={event.user}
                                            handleUpdate={handleEditClick}
                                        />
                                    ))
                                ) : (
                                    <Text>
                                        {" "}
                                        <Loader />
                                    </Text>
                                )}
                            </>
                        )
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default CalendarApp;
