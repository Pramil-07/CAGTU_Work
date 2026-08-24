import React, {useEffect, useState} from "react";
import {FiDelete, FiEdit, FiTrash, FiTrash2} from "react-icons/fi";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {Button, Tooltip, useMantineTheme} from "@mantine/core";
import {useDark} from "@/utils/helpers";
import {MdDeleteForever} from "react-icons/md";
import {TbCircleFilled} from "react-icons/tb";
import {AvailableSlotProps} from "@/types/merchant/AvailableSlotProps";

import {axiosClient} from "@/utils/axiosClient";
import urls from "@/constants/urls";
import Calendar from "@/components/merchant/ProfilePage/Calendar";
import {CiViewList} from "react-icons/ci";
import {toast} from "@/components/common/Toast";
import {openConfirmModal} from "@/components/common/form/ConfirmModal";

dayjs.extend(customParseFormat); // Extend Day.js to handle custom parsing formats

interface Slot {
    startTime: string;
    endTime: string;
    time: string;
    status: string;
}

interface Slots {
    [service: string]: {
        [date: string]: Slot[];
    };
}


const AvailableSlots = ({merchantId, hasPermission, is_service, serviceId}: { merchantId: string|undefined, hasPermission: boolean,is_service?:boolean ,serviceId?:string}) => {
    const [editing, setEditing] = useState<boolean>(false);
    const [slots, setSlots] = useState<Slots>(() => {
        if (typeof window !== "undefined") {
            const savedSlots = localStorage.getItem("availableSlots");
            return savedSlots ? JSON.parse(savedSlots) : {};
        }
        return {};
    });
    const dark = useDark();
    const theme = useMantineTheme();
    const [AvailableSlotsDataState, setAvailableSlotsDataState] = useState<AvailableSlotProps[]>([])
    const [isLoading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddSlotModal, setShowAddSlotModal] = useState(false);

    const [selectedSlotForEdit, setSelectedSlotForEdit] = useState<AvailableSlotProps | null>(null); // Stores the slot to be edited
    const today = dayjs().format('YYYY-MM-DD');

    const fetchdata = async (merchant?: string, entity_service?: string, date?: string): Promise<AvailableSlotProps[]> => {
        try {
            setLoading(true)
            let url = `${urls.merchantSlots.slots}data/`
            const params = new URLSearchParams();
            if (merchant) params.append("merchant", merchant);
            if (entity_service) params.append("entity", entity_service);
            if (date) params.append("date", date);
            if (params.toString()) url += `?${params.toString()}`

            // console.log("this is params url ", url)
            const {data: fetchedAvailableSlotData} = await axiosClient.get(`${url}`,);
            if (fetchedAvailableSlotData && Array.isArray(fetchedAvailableSlotData)) {
                setAvailableSlotsDataState(fetchedAvailableSlotData)
                return fetchedAvailableSlotData;
            } else {
                setError("API response did not return the expected Data Structure")
                return []
            }

        } catch (error) {
            setError("failed to fetch packages")
            return []
        } finally {
            setLoading(false)
        }
    }
    // console.log("slot data",AvailableSlotsDataState)

    // useEffect(() => {
    //     fetchdata();
    // }, []);


    useEffect(() => {
        fetchdata(merchantId, undefined, today);
    }, [today]);


    useEffect(() => {
        // Check if slots are empty and add dummy slots
        const savedSlots =
            typeof window !== "undefined"
                ? localStorage.getItem("availableSlots")
                : null;
        if (savedSlots) {
            setSlots(JSON.parse(savedSlots));
        } else {
            // If no saved slots, use dummy slots
            // updateSlots(initialDummySlots);
        }
    }, []);


    // console.log("merchantId", merchantId)


    const handleDeleteSlot = async (service: any, index: any) => {
        openConfirmModal({
            title: "Delete Confirmation",
            message: "Are you sure you want to delete this item ?",
            onConfirm: async () => {
                const selectedServiceId = service?.id;
                // console.log("Deleting slot with ID:", selectedServiceId);
                try {
                    await axiosClient.delete(
                        `${urls.merchantSlots.slots}?merchant=${merchantId}&daily_schedule=${selectedServiceId}`
                    );
                    fetchdata();
                    toast.success("Slot deleted successfully");
                } catch (error) {
                    console.error("Error deleting the slot:", error);

                }
            },
        });
    };


    const handleAddslots = () => {
        setShowAddSlotModal(true)
    }


    const handleDeleteAllSlots = () => {
        openConfirmModal({
            title: "Delete Confirmation",
            message: "Are you sure you want to delete all item ?",
            onConfirm: async () => {
                try {
                    setLoading(true)
                    await axiosClient.delete(`${urls.merchantSlots.slots}?merchant=${merchantId}`,);
                    fetchdata()
                } catch (error) {
                    setError("error while deleting the slots ")
                } finally {
                    setLoading(false)
                }
                fetchdata(merchantId, undefined, today)
            }
        })


    }


    const handleEditToggle = () => {
        setEditing((prev) => !prev);
    };


    const handleOpenUpdateModal = (service: AvailableSlotProps) => {
        setSelectedSlotForEdit(service);
        setShowAddSlotModal(true); // Open the modal
    };


    function convertTo12HourFormat(time24h: string): string {
        const time = dayjs(time24h, "HH:mm:ss", true);

        if (!time.isValid()) return time24h;

        const hour = time.hour() % 12 || 12;
        const minute = time.minute().toString().padStart(2, '0');
        const second = time.second();
        const ampm = time.format("A");

        // Only include minutes if they're non-zero
        let result = `${hour}:${minute}`;
        if (second !== 0) {
            result += `:${second}`;
        }

        return `${result} ${ampm}`;
    }


//     console.log("available", AvailableSlotsDataState)
//     console.log(
//         "available",
//         AvailableSlotsDataState.map(data =>
//             data.service_time_slots.map(serviceSlot => serviceSlot["entity_service_title"]) // Use bracket notation
//         )
//     );
// console.log("from available slot",serviceId)

    return (
        <div
            style={{
                backgroundColor: dark ? theme.colors.dark[6] : "#fff",
                marginTop: "20px",
                borderRadius:"20px",

                border: is_service && dark ? "0.5px solid grey" : is_service? "0.5px solid lightgrey":"",

            }}
            className="flex flex-col p-4 md:p-6 w-full shadow-black shadow-top-bottom bg-white rounded-lg"
        >
            <Calendar

                onAddSlot={
                    (service: string[], date: string, status: string, startTime: string, endTime: string) => {
                        const formattedDate = dayjs(date).format("MM/DD/YYYY (ddd)");
                        // console.log(service)


                        const time = `${startTime} to ${endTime}`;

                        setSlots((prevSlots) => {
                            // Handle each service in the array
                            const updatedSlots = {...prevSlots};

                            service.forEach(serviceName => {
                                const existingSlots = prevSlots[serviceName]?.[formattedDate] || [];

                                // Check for duplicate slots
                                const isDuplicate = existingSlots.some(
                                    (slot) => slot.time === time && slot.status === status
                                );

                                if (isDuplicate) {
                                    toast.error("You need to choose different slots");
                                    return;
                                }

                                const newSlot: Slot = {
                                    startTime: startTime,
                                    endTime: endTime,
                                    time,
                                    status: 'available' // Using default status as 'available'
                                };

                                // Update slots for this service
                                updatedSlots[serviceName] = {
                                    ...(prevSlots[serviceName] || {}),
                                    [formattedDate]: [...existingSlots, newSlot],
                                };
                            });

                            // Save to localStorage
                            if (typeof window !== "undefined") {
                                localStorage.setItem("availableSlots", JSON.stringify(updatedSlots));
                            }

                            return updatedSlots;
                        });
                    }}
                fetchData={fetchdata}
                userEditing={editing}
                setSelectedSlotForEdit={setSelectedSlotForEdit}
                selectedSlotForEdit={selectedSlotForEdit}
                showAddSlotModal={showAddSlotModal}
                setShowAddSlotModal={setShowAddSlotModal}
                setAvailableSlotsDataState={setAvailableSlotsDataState}
                AvailableSlotsData={AvailableSlotsDataState}
                merchantId={merchantId}
                today={today}
                updateAvailableSlots={(updatedSlot) => {
                    setAvailableSlotsDataState((prevState) =>
                        prevState.map((slot) =>
                            slot.id === updatedSlot.id ? updatedSlot : slot
                        )
                    );
                }}
                is_service={is_service}
                separateServiceId={serviceId}

            />

            {/* Modal for Adding Slots */}


            <div style={{background:theme.colors.brand[0]}} className="flex justify-center  p-2 md:flex-row items-center mb-1">
                <h2 style={{color:theme.colors.brand[4]}} className="text-lg md:text-xl font-bold text-orange-400 ">
                    Available Slots
                </h2>

            </div>

            <div className="rounded p-4 ">
                {/*      <span*/}
                {/*          color="orange"*/}
                {/*          className="flex gap-1 justify-end items-center text-orange-500 text-base cursor-pointer hover:text-orange-300 active:text-orange-700 transition-all duration-300 ease-in-out"*/}
                {/*          onClick={() => fetchdata(merchantId)}*/}
                {/*      >*/}
                {/*     View All Slots <CiViewList/>*/}
                {/*   </span>*/}
                {/*<div className="flex flex-wrap items-center  justify-between mb-6 w-full" style={{ zIndex: 10 }}>*/}
                {/*    <div className="flex flex-wrap gap-2">*/}
                {/*    /!*  <div>*!/*/}
                {/*        /!*    {hasPermission && (*!/*/}
                {/*        /!*        <Button onClick={handleEditToggle} variant={editing ? "outline" : "filled"}>*!/*/}
                {/*        /!*            {editing ? "Stop Editing" : <FiEdit className="w-5 h-5 "/>}*!/*/}
                {/*        /!*        </Button>*!/*/}
                {/*        /!*    )}*!/*/}
                {/*        /!*</div>*!/*/}
                {/*        {hasPermission && (*/}
                {/*            <button*/}
                {/*                // color="orange"*/}
                {/*                className="mx-2.5 font-semibold text-white bg-orange-400 p-3 border rounded-xl"*/}
                {/*                // style={{ zIndex: 10 }}*/}
                {/*                onClick={() => handleAddslots()}*/}
                {/*            >*/}
                {/*                Add Slots*/}
                {/*            </button>*/}
                {/*        )}*/}
                {/*        {hasPermission && (*/}
                {/*            <button*/}
                {/*                // color="red"*/}
                {/*                className="mx-2.5 bg-red-500 p-3 border font-semibold text-white rounded-xl"*/}
                {/*                // style={{ zIndex: 10 }}*/}
                {/*                onClick={() => handleDeleteAllSlots()}*/}
                {/*            >*/}
                {/*                Delete all*/}
                {/*            </button>*/}
                {/*        )}*/}


                {/*    </div>*/}

                {/*</div>*/}
                <hr style={{margin: "10px", marginBottom: "10px"}}/>


                {AvailableSlotsDataState
                    .filter((data) => {
                        // If is_service is true and service_id is provided, only include dates with matching service_id
                        if (is_service && serviceId) {
                            return data.service_time_slots.some(
                                (serviceSlot) => serviceId === serviceSlot.entity_service
                            );
                        }
                        // Otherwise, include all dates
                        return true;
                    }).length > 0 ? (
                    AvailableSlotsDataState
                    .filter((data) => {
                    if (is_service && serviceId) {
                    return data.service_time_slots.some(
                    (serviceSlot) => serviceId === serviceSlot.entity_service
                    );
                }
                    return true;
                })
                    .map((data, index) => (
                        <>
                            <div
                                key={index}
                                className="w-full my-2 px-2 bg-orange-100 flex flex-row gap-2 items-center justify-between text-bold md:w-full mb-2 md:mb-0"
                            >
                                {dayjs(data.date).format("dddd, MMM D, YYYY")}

                                {hasPermission && (
                                    <span className="flex items-center justify-center gap-2">
                                         <Tooltip
                                             label={"Update Slots"}
                                             withArrow
                                             position='top'
                                         >
            <button
                // color="orange"
                // variant="outline"
                // size="small"
                className=" bg-orange-100 hover:text-orange-600"
                onClick={() => handleOpenUpdateModal(data)}
            >
              <FiEdit size={15}/>
            </button>
                                         </Tooltip>
                                         <Tooltip
                                             label={"Delete Slots"}
                                             withArrow
                                             position='top'
                                         >
            <button
                onClick={() => handleDeleteSlot(data, index)}
                className="bg-orange-100 hover:text-orange-600"
            >
              <FiTrash size={15}/>
            </button>
                                         </Tooltip>
          </span>
                                )}
                            </div>
                            {data.service_time_slots
                                .filter((serviceSlot) => {
                                    // Show only matching service_id if both is_service and service_id are provided
                                    if (is_service && serviceId) {
                                        return serviceId === serviceSlot.entity_service;
                                    }
                                    // Otherwise, show all slots
                                    return true;
                                })
                                .map((serviceSlot, index) => (
                                    <div key={index} className="mb-4 flex flex-col bg-orange-50 last:mb-0">
                                        <div style={{display: "flex", justifyContent: "space-around", padding: "8px"}}>
                                            <h3 className="text-sm font-thin">{serviceSlot.entity_service_title}</h3>
                                        </div>

                                        <div className="mb-4 last:mb-0 p-2">
                                            <div className="flex flex-wrap gap-2">
                                                {serviceSlot.time_slots.map((data, index) => {
                                                    const getStatusColor = (status: string | undefined) => {
                                                        switch (status) {
                                                            case "available":
                                                                return "teal-600 text-teal-600";
                                                            case "fast_filling":
                                                                return "blue-600 text-blue-600";
                                                            case "booked":
                                                                return "red-600 text-red-600";
                                                        }
                                                    };

                                                    return (
                                                        <div key={index} className="shrink-0">
                                                            <button
                                                                className={`px-3 py-2 border border-gray-200 text-xs bg-white rounded flex items-center gap-1`}
                                                            >
                                                                <TbCircleFilled className="teal-600 text-orange-600"/>
                                                                {convertTo12HourFormat(data.start_time)} To{" "}
                                                                {convertTo12HourFormat(data.end_time)}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </>
                    ))
                    ) : (
                    <div className="text-center py-4 text-gray-500">
                    No slots are available to show
                    </div>
                    )}


                {/*            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">*/}
                {/*                <div className="flex flex-col sm:flex-row w-full sm:w-auto">*/}
                {/*<span className="px-3 py-1 text-xs rounded flex items-center gap-1 text-teal-600 mt-2 ml-7 sm:ml-0">*/}
                {/*  <TbCircleFilled className="text-teal-600"/>*/}
                {/*  Available*/}
                {/*</span>*/}
                {/*                    <span*/}
                {/*                        className="px-3 py-1 text-xs rounded flex items-center gap-1 text-blue-400 mt-2 ml-7 sm:ml-4">*/}
                {/*  <TbCircleFilled className="text-blue-400"/>*/}
                {/*  Fast Filling*/}
                {/*</span>*/}
                {/*                    <span*/}
                {/*                        className="px-3 py-1 text-xs rounded flex items-center gap-1 text-red-500 mt-2 ml-7 sm:ml-4">*/}
                {/*  <TbCircleFilled className="text-red-500"/>*/}
                {/*  Booked*/}
                {/*</span>*/}
                {/*                </div>*/}
                {/*            </div>*/}
            </div>
        </div>
    );
};


export default AvailableSlots;



