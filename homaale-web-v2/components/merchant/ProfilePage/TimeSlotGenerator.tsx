import React, {useEffect, useState} from 'react';
import {
    Group,
    NumberInput,
    Button,
    Text,
    Stack,
    Input, Select,
} from '@mantine/core';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {MerchantStaffResponse} from "@/components/merchant/ProfilePage/Calendar";
import {AvailableSlotProps} from "@/types/merchant/AvailableSlotProps";
import {Trash} from "lucide-react";
import {showNotification} from "@mantine/notifications";

dayjs.extend(customParseFormat);

interface TimeSlot {
    start: string;
    end: string;
}

interface TimeSlotGeneratorProps {
    serviceIndex: number;
    onGenerate: (serviceIndex: number, slots: { start: string; end: string }[]) => void;
    staffData: MerchantStaffResponse | undefined;
    modelServices: AvailableSlotProps[];
    setModelServices: React.Dispatch<React.SetStateAction<AvailableSlotProps[]>>
    showAddSlotModal: boolean;
    setShowAddSlotModal: React.Dispatch<React.SetStateAction<boolean>>;
    selectedSlotForEdit: AvailableSlotProps | null;
    handelStaffDropdown: (
        selectedValue: string | null,
        serviceId: string,
        timeSlotId: number
    ) => void;
}

export default function TimeSlotGenerator({
                                              serviceIndex,
                                              onGenerate,
                                              staffData,
                                              modelServices,
                                              handelStaffDropdown,
                                              setModelServices,

                                          }: TimeSlotGeneratorProps) {
    const [startTime, setStartTime] = useState('12:00 PM');
    const [intervalCount, setIntervalCount] = useState(5);
    const [intervalDuration, setIntervalDuration] = useState(60);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    console.log("interval slot", slots)

    const generateSlots = () => {
        const baseTime = dayjs(startTime, 'hh:mm A');
        const newSlots = Array.from({length: intervalCount}, (_, index) => {
            const slotStart = baseTime.add(index * intervalDuration, 'minute');
            const slotEnd = slotStart.add(intervalDuration, 'minute');
            return {
                start: slotStart.format('HH:mm:ss '),
                end: slotEnd.format('HH:mm:ss '),
            };
        });

        const lastEnd = baseTime.add(intervalCount * intervalDuration, 'minute');
        if (!lastEnd.isSame(baseTime, 'day')) {
            showNotification({
                title: 'Invalid Time Range',
                message: 'Time slots must stay within a single day (00:00 to 11:59 PM)',
                color: 'red',
            });
            return;
        }
        setSlots(newSlots);
        onGenerate(serviceIndex, newSlots);
    };


    const clearSlots = () => {
        setSlots([]);
    };
    const deleteTimeSlot = (start: string, end: string, staff: number | null | undefined) => {
        setModelServices((prev) => {
            if (!prev) return prev; // Handle undefined safely

            return prev.map((service) => ({
                ...service,
                service_time_slots: service.service_time_slots.map((slotGroup) => ({
                    ...slotGroup,
                    time_slots: slotGroup.time_slots.filter(
                        (time) =>
                            time.start_time !== start ||
                            time.end_time !== end ||
                            (time.staff?.toString() || null) !== (staff?.toString() || null)
                    ),
                })),
            }));
        });
    };


    return (
        <Stack spacing="xs" className="rounded-md border p-4 border-gray-200">
            <Text size="md" weight={500}>Generate Time Slots</Text>

            <Group grow spacing="sm">
                <div className="w-full">
                    <Text>Start Time</Text>
                    <Input

                        type="time"
                        value={dayjs(startTime, 'hh:mm A').format('HH:mm')}
                        onChange={(event) =>
                            setStartTime(
                                dayjs(event.currentTarget.value, 'HH:mm').format('hh:mm A')
                            )
                        }
                    />
                </div>

                <NumberInput
                    label="Number of Slots"
                    value={intervalCount}
                    onChange={(val) => setIntervalCount(Number(val))}
                    min={1}
                />

                <NumberInput
                    label="Duration (min)"
                    value={intervalDuration}
                    onChange={(val) => setIntervalDuration(Number(val))}
                    min={1}
                />
            </Group>

            <Group position="right" mt="xs">
                <Button onClick={clearSlots} variant="outline" color="gray" size="sm">
                    Clear
                </Button>
                <Button onClick={generateSlots} color="orange" variant="light" size="sm">
                    Generate
                </Button>
            </Group>
            {slots.length > 0 && (
                <Stack spacing="xs" mt="sm" bg="gray-300">
                    {modelServices.map((service) =>
                        service.service_time_slots.map((d) =>
                            d.time_slots.map((time, index) => (
                                    <>
                                        <div key={`${service.id}-${time.id}`}
                                             className=" flex items-center justify-evenly gap-4 border p-2">

                                            <span className="flex items-center justify-evenly gap-4"> {`${index + 1}.`}
                                                <Text size="sm" color="gray.7">
                                                {dayjs(time.start_time, 'HH:mm:ss').format('hh:mm A')} — {dayjs(time.end_time, 'HH:mm:ss').format('hh:mm A')}
                                            </Text>
                                            </span>


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
                                            <button className="text-red-700"
                                                    onClick={() => deleteTimeSlot(time.start_time, time.end_time, time.staff)}>
                                                <Trash className=' rounded-xl hover:bg-red-400 hover:size-3xl'
                                                       size={16}/>
                                            </button>
                                        </div>
                                    </>

                                )
                            )
                        )
                    )}
                </Stack>
            )}

        </Stack>
    );
}
