interface EntityServiceProps {
    total_pages: number;
    count: number;
    current: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    result: Result[];
}

interface Result {
    id: string;
    slug: string;
    created_at: string;
    created_by: User;
    owner: User ;
    title: string;
    currency: Currency;
    city: City;
    is_online: boolean;
    service: Service;
    images: any[]; // Replace `any[]` with the specific type if known
    rating: number;
    budget_type: string;
    is_requested: boolean;
    location: string | null;
    is_range: boolean;
    count: number;
    is_endorsed: boolean;
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    videos: any[]; // Replace `any[]` with the specific type if known
    is_bookmarked: boolean;
    budget_from: string;
    budget_to: string;
    payable_from: string;
    payable_to: string;
    rating_count: number;
    booked_count: number;
}
interface User {
    id: string;
    username: string;
    email: string | null;
    phone: string | null;
    full_name: string;
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    profile_image: string | null;
    bio: string | null;
    created_at: string;
    designation: string | null;
    is_profile_verified: boolean;
    is_followed: boolean;
    is_following: boolean;
    badge: string | null;
}

interface Currency {
    code: string;
    name: string;
    symbol: string;
}

interface City {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: Country;
}

interface Country {
    name: string;
    code: string;
}

interface Service {
    id: string;
    title: string;
    is_active: boolean;
    is_verified: boolean;
    category: Category;
    images: any[]; // Replace `any[]` with the specific type if known
    required_documents: any[]; // Replace `any[]` with the specific type if known
    commission: string;
}

interface Category {
    id: number;
    name: string;
    level: number;
    slug: string;
}

import React, {useEffect, useState} from 'react';
import {
    Modal,
    Button,
    Select,
    Group,
    Stack,
    Text,
    Card,
    ActionIcon,
    Alert,
    Input,
} from '@mantine/core';
import { Plus, Trash } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import axios from "axios";

interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    status: string;
    staff_id?: string;
}

interface ServiceSlot {
    id: string;
    entity_service_title: string;
    entity_service: string;
    time_slots: TimeSlot[];
}

interface ServiceSection {
    id: string;
    service_time_slots: ServiceSlot[];
    merchant: string | undefined;
    is_active: boolean;
    date: string;
}


const AddSlotModal: React.FC<{
    opened: boolean;
    onClose: () => void;
    entityServiceData: any;
    onAddSlot: (data: any) => Promise<void>;
    selectedDate: Date | null;
    merchantId: string;
}> = ({ opened, onClose, entityServiceData, onAddSlot, selectedDate, merchantId }) => {
    const [services, setServices] = useState<ServiceSection[]>([]);
    const [loading, setLoading] = useState(false);
    const [errro , setError] = useState("");
    const [entityServiceDataState , setEntityServiceDataState]= useState <EntityServiceProps >()
    const [staffData, setStaffData] = useState()
    const [selectedEntityServiceId , setSelectedEntityServiceId] = useState<string [] >([]);
    const [selectedEntityService , setSelectedEntityService]= useState<{ value: string; label: string } | null>(null);
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM3NjA4MDkzLCJpYXQiOjE3MzczOTIwOTMsImp0aSI6IjFhOGNjNzExNmJkNzRkZDliMWNmNmRhZjZiMzAwYTJiIiwidXNlcl9pZCI6IjQzZDRlMDZhLTE5MWEtNDRmZS1hNDYzLTAyMDMzMDhiM2Y0MCJ9.LZn_CoJVezJT02bzlTEcxQDPaC07xSH4y4d7hmpQYM8"
    const apiUrl = "http://localhost:8000/api/v2/availableSlot/"
    const entityUrl =  "http://localhost:8000/api/v2/task/entity/service/"

    useEffect(()=>{
        const fetchdata = async () =>{
            try {
                setLoading(true)
                const {data : fetchedEntityServiceData } = await axios.get( entityUrl,
                    {
                        headers:{
                            Authorization:`Bearer ${token}`,
                        },
                    } );

                setEntityServiceDataState(fetchedEntityServiceData)

            }catch (error){
                setError("failed to fetch entity")
            }finally {
                setLoading(false)
            }
        }
        fetchdata();
    },[])

    // useEffect(()=>{
    //     const fetchdata = async () =>{
    //         try {
    //             setLoading(true)
    //             const {data : fetchedStaffData } = await axios.get( `http://localhost:8000/api/v2/merchant/staff/list/${merchantId}`,
    //                 {
    //                     headers:{
    //                         Authorization:`Bearer ${token}`,
    //                     },
    //                 } );
    //             // if(fetchedEntityServiceData && Array.isArray(fetchedEntityServiceData)) {
    //             //     setEntityServiceDataState(fetchedEntityServiceData)
    //             // }else {
    //             //     setError("API response did not return the expected Data Structure")
    //             // }
    //             setEntityServiceDataState(fetchedStaffData)
    //         }catch (error){
    //             setError("failed to fetch entity")
    //         }finally {
    //             setLoading(false)
    //         }
    //     }
    //     fetchdata();
    // },[])

    const addService = () => {
        const newService: ServiceSection = {
            id: crypto.randomUUID(),
            service_time_slots: [{
                id: crypto.randomUUID(),
                entity_service_title: '',
                entity_service: '',
                time_slots: [{
                    id: Date.now(),
                    start_time: '',
                    end_time: '',
                    status: 'available',
                }]
            }],
            merchant: merchantId,
            is_active: true,
            date: selectedDate?.toISOString() || new Date().toISOString()
        };
        setServices([...services, newService]);
    };

    const removeService = (serviceId: string) => {
        setServices(services.filter(service => service.id !== serviceId));
    };

    const addTimeSlot = (serviceId: string) => {
        setServices(services.map(service => {
            if (service.id === serviceId) {
                const updatedTimeSlots = service.service_time_slots.map(slot => ({
                    ...slot,
                    time_slots: [...slot.time_slots, {
                        id: Date.now(),
                        start_time: '',
                        end_time: '',
                        status: 'available'
                    }]
                }));
                return { ...service, service_time_slots: updatedTimeSlots };
            }
            return service;
        }));
    };

    const removeTimeSlot = (serviceId: string, timeSlotId: number) => {
        setServices(services.map(service => {
            if (service.id === serviceId) {
                const updatedTimeSlots = service.service_time_slots.map(slot => ({
                    ...slot,
                    time_slots: slot.time_slots.filter(t => t.id !== timeSlotId)
                }));
                return { ...service, service_time_slots: updatedTimeSlots };
            }
            return service;
        }));
    };

    const updateTimeSlot = (
        serviceId: string,
        timeSlotId: number,
        field: keyof TimeSlot,
        value: string
    ) => {
        setServices(services.map(service => {
            if (service.id === serviceId) {
                const updatedTimeSlots = service.service_time_slots.map(slot => ({
                    ...slot,
                    time_slots: slot.time_slots.map(t =>
                        t.id === timeSlotId ? { ...t, [field]: value } : t
                    )
                }));
                return { ...service, service_time_slots: updatedTimeSlots };
            }
            return service;
        }));
    };

    const handleServiceSelection = (serviceId: string, value: string) => {
        setServices(services.map(service => {
            if (service.id === serviceId) {
                const selectedService = entityServiceData?.result?.find((s: any) => s.id === value);
                const updatedTimeSlots = service.service_time_slots.map(slot => ({
                    ...slot,
                    entity_service: value,
                    entity_service_title: selectedService?.title || ''
                }));
                return { ...service, service_time_slots: updatedTimeSlots };
            }
            return service;
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            // Transform the data structure to match API requirements
            const formattedServices = services.map(service => ({
                merchant: service.merchant,
                Entity_serviceId: service.service_time_slots[0].entity_service,
                service: [service.service_time_slots[0].entity_service],
                start_time: service.service_time_slots[0].time_slots[0].start_time,
                end_time: service.service_time_slots[0].time_slots[0].end_time,
                date: selectedDate?.toISOString().split('T')[0],
                status: service.service_time_slots[0].time_slots[0].status
            }));

            await Promise.all(formattedServices.map(onAddSlot));

            notifications.show({
                title: 'Success',
                message: 'Slots added successfully',
                color: 'green',
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });

            onClose();
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to add slots',
                color: 'red',
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        } finally {
            setLoading(false);
        }
    };


    const handleDropdown = (selectedValue : string)=>{
        const  selectedService= entityServiceDataState?.result?.find((item)=> item.id === selectedValue);

        if(selectedService){
            setSelectedEntityService({
                value: selectedService.id,
                label : selectedService.title,
            })
            console.log(selectedService.id)
            // to get id of selected service from drop down
            setSelectedEntityServiceId(()=>[selectedService.id])
        }
    }
    useEffect(() => {
        console.log("Props:", { opened, entityServiceData, selectedDate, merchantId });
    }, [opened, entityServiceData, selectedDate, merchantId]);


    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Text size="xl" weight={700}>Add New Time Slots</Text>}
            size="xl"
            padding="md"
            zIndex={100}
        >
            <Stack spacing="md">
                <Group position="right">
                    <Button
                        leftIcon={<Plus size={16} />}
                        onClick={addService}
                        variant="filled"
                        color="orange"
                    >
                        Add New Service
                    </Button>
                </Group>

                {services.length === 0 && (
                    <Alert color="orange" title="No services added">
                        Click the &#34;Add New Service&#34; button to get started
                    </Alert>
                )}

                {services.map((service) => (
                    <Card key={service.id} shadow="sm" p="md" radius="md" withBorder>
                        <Stack spacing="md">
                            <Group position="apart">
                                <Text weight={500} size="lg">
                                    {service.service_time_slots[0].entity_service_title || 'New Service'}
                                </Text>
                                <ActionIcon
                                    color="red"
                                    onClick={() => removeService(service.id)}
                                    variant="subtle"
                                >
                                    <Trash size={16} />
                                </ActionIcon>
                            </Group>

                            <Select
                                label="Select Service"
                                placeholder="Choose a service"
                                data={entityServiceData?.result?.map((item: any) => ({
                                    value: item.id,
                                    label: item.title,
                                })) || []}
                                value={service.service_time_slots[0].entity_service}
                                onChange={(value) => handleServiceSelection(service.id, value || '')}
                                required
                            />

                            <Stack spacing="xs">
                                <Group position="apart">
                                    <Text weight={500}>Time Slots</Text>
                                    <Button
                                        variant="subtle"
                                        size="sm"
                                        onClick={() => addTimeSlot(service.id)}
                                        leftIcon={<Plus size={16} />}
                                    >
                                        Add Time Slot
                                    </Button>
                                </Group>

                                {service.service_time_slots[0].time_slots.map((timeSlot) => (
                                    <Card key={timeSlot.id} withBorder p="sm">
                                        <Stack spacing="sm" className="gap-4">
                                            <Group grow className="items-center gap-4">
                                                <Text>Start Time</Text>
                                                <Input
                                                    className="w-[128px]"
                                                    type="time"
                                                    value={timeSlot.start_time}
                                                    onChange={(event) =>
                                                        updateTimeSlot(
                                                            service.id,
                                                            timeSlot.id,
                                                            'start_time',
                                                            event.currentTarget.value
                                                        )
                                                    }
                                                    required
                                                />
                                                <Text>End Time</Text>
                                                <Input
                                                    className="w-[128px]"
                                                    type="time"
                                                    value={timeSlot.end_time}
                                                    onChange={(event) =>
                                                        updateTimeSlot(
                                                            service.id,
                                                            timeSlot.id,
                                                            'end_time',
                                                            event.currentTarget.value
                                                        )
                                                    }
                                                    required
                                                />
                                            </Group>
                                            <Group grow className="items-center gap-4">
                                                {/*<Text>Assign Staff</Text>*/}
                                                <Select
                                                    label="Staff"
                                                    data={
                                                        entityServiceDataState?.result?.map((item) => ({
                                                            value: item.id,
                                                            label: item.title,
                                                        })) || []
                                                    }
                                                    placeholder="Select a Staff"
                                                    required
                                                    multiple
                                                    onChange={handleDropdown}
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
                                                    onChange={(value) =>
                                                        updateTimeSlot(
                                                            service.id,
                                                            timeSlot.id,
                                                            'status',
                                                            value || 'available'
                                                        )
                                                    }
                                                    data={[
                                                        { value: 'available', label: 'Available' },
                                                        { value: 'fast_filling', label: 'Fast Filling' },
                                                        { value: 'booked', label: 'Booked' },
                                                    ]}
                                                />
                                            </Group>
                                        </Stack>
                                        <ActionIcon
                                            color="red"
                                            onClick={() => removeTimeSlot(service.id, timeSlot.id)}
                                            variant="subtle"
                                            style={{ marginTop: '24px' }}
                                        >
                                            <Trash size={16} />
                                        </ActionIcon>

                                    </Card>
                                ))}
                            </Stack>
                        </Stack>
                    </Card>
                ))}

                <Group position="right" mt="xl">
                    <Button variant="subtle" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={services.length === 0}
                        className="text-white"
                    >
                        Save All Slots
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};

export default AddSlotModal;
