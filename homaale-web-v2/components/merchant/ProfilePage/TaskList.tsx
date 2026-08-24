import React, { useState } from "react";
import { DateTimePicker } from "@mantine/dates";
import { useMantineTheme } from "@mantine/core";
import { useDark } from "@/utils/helpers";
import {
    PiHouseLineBold,
} from "react-icons/pi";
import { LuAlarmClock } from "react-icons/lu";
import {
    FaBroom,
    FaCode,
    FaDatabase,
    FaGraduationCap,
    FaLaptopCode,
    FaRegCalendar,
    FaStethoscope
} from "react-icons/fa6";
import { BsTools } from "react-icons/bs";
import { TbToolsKitchen2, TbTruckDelivery } from "react-icons/tb";
import { IoIosCut, IoIosFitness } from "react-icons/io";
import { IoHeadset } from "react-icons/io5";
import {
    MdOutlineDeliveryDining,
    MdOutlinePets,
    MdOutlineSupportAgent
} from "react-icons/md";
import { FaQuestion, FaRunning } from "react-icons/fa";
import {useMediaQuery} from "@mantine/hooks";
import {AiFillSecurityScan} from "react-icons/ai";

type Task = {
    id: number;
    title: string;
    date: Date | null;
    time: string;
    description: string;
    price: string;
    type: "non-recurring" | "recurring";
    category: "my-task" | "service";
    icon: string;
};

const iconMap = {
    house: PiHouseLineBold,
    clock: LuAlarmClock,
    calendar: FaRegCalendar,
    broom: FaBroom,
    code: FaCode,
    laptop: FaLaptopCode,
    doctor: FaStethoscope,
    motar: MdOutlineDeliveryDining,
    tools: BsTools,
    dinner: TbToolsKitchen2,
    gym: IoIosFitness,
    fitness: FaRunning,
    pets: MdOutlinePets,
    callSupport: MdOutlineSupportAgent,
    education: FaGraduationCap,
    music: IoHeadset,
    delivery: TbTruckDelivery,
    haircare: IoIosCut,
    security: AiFillSecurityScan,
    Default: FaQuestion,
    database: FaDatabase,
};

const IconPicker = ({
                        selectedIcon,
                        onSelectIcon,
                        className,
                    }: {
    selectedIcon: string;
    onSelectIcon: (icon: string) => void;
    className?: string;
}) => {
    return (
        <div className="grid grid-cols-4 gap-2 p-2 mb-4 border rounded max-h-32 overflow-y-scroll">
            {Object.entries(iconMap).map(([iconKey, IconComponent]) => (
                <div
                    key={iconKey}
                    onClick={() => onSelectIcon(iconKey)}
                    className={`flex flex-col items-center justify-center p-2 cursor-pointer rounded hover:bg-gray-100 ${
                        selectedIcon === iconKey ? "bg-blue-50 border border-blue-300" : ""
                    }`}
                >
                    <IconComponent className="text-2xl mb-1 text-black" />
                    <span className="text-xs text-center text-black ">{iconKey}</span>
                </div>
            ))}
        </div>
    );
};

const TaskList = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState<Task>({
        id: Date.now(),
        title: "",
        date: null,
        time: "",
        description: "",
        price: "",
        type: "non-recurring",
        category: "my-task",
        icon: "Default",
    });
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const smallScreen = useMediaQuery("(max-width:768px)");
    const screen150 = useMediaQuery('(max-width: 1400px) and (min-width: 768px)');

    const formatDateTime = (date: Date | null) => {
        if (!date) return "";
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (editingTask) {
            setEditingTask({ ...editingTask, [name]: value });
        } else {
            setNewTask({ ...newTask, [name]: value });
        }
    };

    const handleIconSelect = (icon: string) => {
        if (editingTask) {
            setEditingTask({ ...editingTask, icon });
        } else {
            setNewTask({ ...newTask, icon });
        }
    };

    const handleDateChange = (date: Date | null) => {
        if (editingTask) {
            setEditingTask({ ...editingTask, date });
        } else {
            setNewTask({ ...newTask, date });
        }
    };

    const handleAddOrUpdateTask = () => {
        const task = editingTask || newTask;

        // Validation
        if (!task.title.trim()) {
            alert("Title is required.");
            return;
        }
        if (!task.description.trim()) {
            alert("Description is required.");
            return;
        }
        if (!task.price.trim()) {
            alert("Price is required.");
            return;
        }

        // Add or update task
        if (editingTask) {
            setTasks(tasks.map((task) => (task.id === editingTask.id ? editingTask : task)));
        } else {
            setTasks([...tasks, { ...newTask, id: Date.now() }]);
        }

        // Reset modal state
        setEditingTask(null);
        setNewTask({
            id: Date.now(),
            title: "",
            date: null,
            time: "",
            description: "",
            price: "",
            type: "non-recurring",
            category: "my-task",
            icon: "Default",
        });
        setIsModalOpen(false);
    };


    const handleDeleteTask = (id: number) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    const theme = useMantineTheme();
    const dark = useDark();

    const getTaskColor = (category: string, type: string) => {
        const colors = {
            'my-task': {
                'recurring': 'bg-purple-50 hover:bg-purple-100',
                'non-recurring': 'bg-green-50 hover:bg-green-100'
            },
            'service': {
                'recurring': 'bg-blue-50 hover:bg-blue-100',
                'non-recurring': 'bg-pink-50 hover:bg-pink-100'
            }
        };
        return colors[category as keyof typeof colors][type as keyof typeof colors['my-task']];
    };

    return (
        <div className="p-4">
            <div className="flex items-center mb-4 justify-between">
                <button
                    onClick={() => {
                        setEditingTask(null);
                        setIsModalOpen(true);
                    }}
                    className="w-32 bg-green-800 text-white px-4 py-2 rounded hover:bg-green-500 transition-colors"
                >
                    Add Task
                </button>
                <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`w-32  px-4 py-2 rounded transition-colors ${
                        isEditMode
                            ? 'bg-blue-400 text-white hover:bg-blue-500'
                            : 'bg-red-400 text-white hover:bg-red-500'
                    }`}
                >
                    {isEditMode ? 'Done' : 'Edit'}
                </button>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md"
                         style={{background: dark ? "#d1d5db" : ""}}>
                        <h2 className="text-xl font-bold mb-4">{editingTask ? "Edit Task" : "Add Task"}</h2>

                        <input
                            name="title"
                            type="text"
                            placeholder="Title"
                            value={editingTask ? editingTask.title : newTask.title}
                            onChange={handleInputChange}
                            className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />

                        <DateTimePicker
                            value={editingTask ? editingTask.date : newTask.date}
                            onChange={handleDateChange}
                            placeholder="Select date"
                            className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />

                        <textarea
                            name="description"
                            placeholder="Description"
                            value={editingTask ? editingTask.description : newTask.description}
                            onChange={handleInputChange}
                            className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />

                        <input
                            name="price"
                            type="text"
                            placeholder="Price"
                            value={editingTask ? editingTask.price : newTask.price}
                            onChange={handleInputChange}
                            className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />

                        <select
                            name="type"
                            value={editingTask ? editingTask.type : newTask.type}
                            onChange={handleInputChange}
                            className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        >
                            <option value="non-recurring">Non-Recurring</option>
                            <option value="recurring">Recurring</option>
                        </select>

                        <select
                            name="category"
                            value={editingTask ? editingTask.category : newTask.category}
                            onChange={handleInputChange}
                            className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        >
                            <option value="my-task">My Task</option>
                            <option value="service">Service</option>
                        </select>

                        <div className="flex mb-2 font-bold text-lg text-gray-600">Select Icon</div>
                        <IconPicker
                            selectedIcon={editingTask ? editingTask.icon : newTask.icon}
                            onSelectIcon={handleIconSelect}
                            className="fill-black"
                        />

                        <div className="flex justify-between gap-4">
                            <button
                                onClick={handleAddOrUpdateTask}
                                className="flex-1 bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors"
                            >
                                {editingTask ? "Update" : "Add"}
                            </button>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingTask(null);
                                }}
                                className="flex-1 bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {tasks.map((task) => {
                    const IconComponent = iconMap[task.icon as keyof typeof iconMap] || iconMap.Default;

                    return (
                        <div
                            style={{
                                borderRadius: "15px",
                            }}
                            key={task.id}
                            className={`flex justify-between items-center p-4 rounded-lg shadow-sm ${getTaskColor(task.category, task.type)} transition-all hover:shadow-md`}
                        >
                            <div className="flex items-center gap-4">
                                <IconComponent className="text-2xl text-gray-600"/>
                                <div>
                                    <div className="font-bold text-gray-800">{task.title}</div>
                                    <div className="text-sm text-gray-600">{task.description}</div>
                                    <div className="text-sm text-gray-600">{formatDateTime(task.date)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {!isEditMode && task.price && (
                                    <div className="text-sm font-medium text-gray-700">
                                       {task.price}
                                    </div>
                                )}
                                {isEditMode && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingTask(task);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div
                className=" flex flex-col justify-between mt-4 w-full text-xs leading-relaxed min-h-[16px] text-neutral-800 max-md:max-w-full">
                <div className="flex flex-col justify-between w-full min-h-[16px] max-md:max-w-full">
                    <div className="flex gap-10 justify-between items-start w-full max-md:max-w-full">
                        <div className="flex gap-1 items-center">
                            <div
                                className="flex shrink-0 self-stretch my-auto w-3 h-3 bg-green-300 rounded-full fill-teal-600"/>
                            <div style={{color: dark ? "white" : "black"}} className="gap-1 self-stretch my-auto">
                                My Tasks<br/>(non-recurring)
                            </div>
                        </div>
                        <div className="flex gap-1 items-center">
                            <div
                                className="flex shrink-0 self-stretch my-auto w-3 h-3  bg-purple-300 rounded-full fill-violet-700"/>
                            <div style={{color: dark ? "white" : "black"}} className="gap-1 self-stretch my-auto">
                                My Tasks <br/>(Recurring){" "}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="flex flex-col mt-4 w-full text-xs leading-relaxed whitespace-nowrap min-h-[16px] text-neutral-800 max-md:max-w-full">
                <div className="flex flex-col w-full min-h-[16px] max-md:max-w-full">
                    <div className="flex gap-10 justify-between items-start w-full max-md:max-w-full">
                        <div className="flex gap-1 items-center w-[129px]">
                            <div className="flex shrink-0 self-stretch my-auto w-3 h-3 bg-pink-300 rounded-full"/>
                            <div style={{color: dark ? "white" : "black"}} className="gap-1 self-stretch my-auto">
                                Services<br/>(non-recurring)
                            </div>
                        </div>
                        <div className="flex gap-1 items-center ">
                            <div
                                className="flex shrink-20 self-stretch my-auto w-3 h-3 bg-blue-300 rounded-full fill-sky-500"/>
                            <div style={{color: dark ? "white" : "black"}} className="gap-1 self-stretch my-auto">
                                Services <br/>(Recurring)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskList;
