import React, {useEffect, useState} from 'react';
import {MdModeEdit, MdVerified} from 'react-icons/md';
import {FaAward} from 'react-icons/fa';
import {useMediaQuery} from '@mantine/hooks';
import {Profile} from "@/components/merchant/ProfilePage/ProfilePage";
import {useBookingDetail} from "@/hooks/useBookingDetail";
import {TASK_STATUS} from "@/constants/TASK_STATUS";
import {Progress, Skeleton, Flex} from "@mantine/core";
import type {TaskBookDetailProps} from "@/types/booking/TaskBookDetailProps";
import {axiosClient} from "@/utils/axiosClient";
import {notifications} from "@mantine/notifications";
import urls from "@/constants/urls";
import {EntityServiceProps} from "@/types/merchant/EntityServiceProps";
import type {TaskBookingProps} from "@/types/booking/TaskBookingProps";
import {useRouter} from 'next/router'; // Added for Next.js routing
import ConvertAndFormat from '@/components/CurrencyNumberFormatter/ConvertAndFormat';
import { useCurrency } from '@/currency/CurrencyContext';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    actionText?: string;
    bgColor: string;
    textColor: string;
    isVerified?: boolean;
    data?: Profile;
}

interface BalanceCardProps {
    balance: string;
    currency: string;
    globalCurrency: string;
    exchangeRate: number;
}

const TaskStats = ({hasPermission, data}: { hasPermission: any, data: Profile | null }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [rewardPoints, setRewardPoints] = useState<string>('0');
    const [balance, setBalance] = useState<string>('0')
    const[currency, setCurrency] = useState<string>("");
    const {globalCurrency}= useCurrency();
    const[exchangeInfo, setExchangeInfo] = useState<number>(89.0);
      useEffect(() => {
            const fetchExchangeRate = async () => {
                const exchangeData= await axiosClient.get(`locale/cms/exchangerate`);
                const { result } = exchangeData.data;
                // Extract value and currency code
                const rate = parseFloat(result[0]?.value); // Save only the exchange rate (e.g., 89.0)
               
                setExchangeInfo(rate);
                console.log('Extracted Exchange Info:', exchangeInfo);
    
            }
            fetchExchangeRate();
        }),[]

    useEffect(() => {
        const fetchRewardPoints = async () => {
            try {
                const {data} = await axiosClient.get('rewards/reward-points');
                setRewardPoints(data.current?.toString() ?? '0');
                // console.log(rewardPoints);
            } catch (err) {
                console.error("Error fetching reward points:", err);

            }
        };
        fetchRewardPoints();
    }, []);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const {data} = await axiosClient.get('wallet/mywallet/');
                setBalance(data[0]?.available_balance?.toString() ?? '0');
                setCurrency(data[0]?.currency ?? 'AUD');
                console.log("Balance fetched: ",data[0]?.currency );
                // console.log("balance", balance);
            } catch (err) {
                console.error("Error fetching balance : ", err);

            }
        }
        fetchBalance();
    }, []);

    return (
        <div className="flex flex-col min-w-[240px] w-full max-w-[757px] mx-auto">
            <div
                className={`flex flex-wrap gap-6 max-md:max-w-full w-full ${hasPermission ? 'justify-evenly' : 'justify-evenly md:justify-end'}`}>                {hasPermission && (
                <StatCard
                    icon={<MdVerified/>}
                    title="KYC"
                    value="KYC"
                    subtitle="KYC Verified"
                    actionText="Update"
                    bgColor="bg-blue-50"
                    textColor="text-green-500"
                    isVerified={data?.is_kyc_verified}
                />
            )}
                {/*{hasPermission && (*/}
                <TaskProgressCard data={data}/>
                {/*)}*/}
                {hasPermission && (
                    <StatCard
                        icon={<FaAward/>}
                        title=""
                        value={rewardPoints ?? '0'}
                        subtitle="Reward Points"
                        actionText="Redeem"
                        bgColor="bg-amber-500 bg-opacity-10"
                        textColor="text-amber-500"
                    />
                )}
                {hasPermission && (
                    <BalanceCard balance={balance} currency={currency} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}/>
                )}
            </div>
            {hasPermission && (
                <TaskProgress/>
            )}

        </div>
    );
};

const StatCard: React.FC<StatCardProps> = ({
                                               icon,
                                               title,
                                               value,
                                               subtitle,
                                               actionText,
                                               bgColor,
                                               textColor,
                                               isVerified
                                           }) => {
    const router = useRouter();

    const handleRedirect = () => {
        if (actionText === 'Redeem') {
            router.push('/redeem');
        } else if (actionText === 'Update') {
            router.push('/kyc-update');
        }
    };

    // console.log("kyc", isVerified)
    return (
        <div
            className={`flex flex-col items-center px-4 pt-4 pb-2 rounded min-h-[124px] shadow-[0px_4px_4px_rgba(0,0,0,0.08)] w-full max-w-[173px] ${bgColor}`}
        >
            <div className="flex flex-col items-center">
                <div className="flex gap-2 items-center text-2xl text-center whitespace-nowrap">
                    <span
                        className={`self-stretch my-auto w-8 font-black leading-none ${
                            title === 'KYC'
                                ? (isVerified ? 'text-green-500' : ' text-red-500')
                                : textColor
                        }`}
                        aria-hidden="true"
                    >
                        {icon}
                    </span>
                    <span
                        className={`self-stretch my-auto font-medium leading-10 ${
                            title === 'Reward Points' ? 'text-black dark:text-white' : 'text-neutral-700'
                        }`}
                    >
                     {value}
                    </span>
                </div>
                <span
                    className={`text-xs ${
                        title === 'Reward Points' ? 'text-black dark:text-white' : 'text-zinc-600'

                    }`}
                >
                    {title === 'KYC' && (
                        <span>
                            {isVerified ? 'KYC Verified' : 'Verify Your KYC now.'}
                        </span>
                    )}
                    {title !== 'KYC' && subtitle}
                </span>
            </div>
            {actionText && (actionText !== "Update" || !isVerified) && (
                <button
                    onClick={handleRedirect}
                    className="flex gap-2 justify-center items-center mt-2 w-full text-sm text-sky-400 whitespace-nowrap max-w-[141px]">
                    {actionText === "Update" && <MdModeEdit className="text-lg"/>}
                    {actionText === "Redeem" && (
                        <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M8.91406 11.7969C8.3125 12.0156 7.65625 12.125 7 12.125C6.31641 12.125 5.66016 12.0156 5.05859 11.7969C5.03125 11.7969 5.03125 11.7969 5.03125 11.7969C4.21094 11.4961 3.47266 11.0039 2.87109 10.375C1.91406 9.36328 1.3125 7.96875 1.3125 6.4375C1.3125 3.32031 3.85547 0.75 7 0.75C10.1172 0.75 12.6875 3.32031 12.6875 6.4375C12.6875 7.96875 12.0586 9.36328 11.1016 10.375C11.0742 10.4023 11.0469 10.457 11.0195 10.4844C10.418 11.0586 9.70703 11.5234 8.91406 11.7969ZM6.42578 3.8125V3.97656C6.28906 4.03125 6.125 4.05859 6.01562 4.14062C5.60547 4.30469 5.25 4.66016 5.14062 5.15234C5.11328 5.42578 5.14062 5.69922 5.25 5.94531C5.35938 6.19141 5.55078 6.35547 5.71484 6.49219C6.04297 6.71094 6.45312 6.82031 6.78125 6.92969H6.83594C7.21875 7.06641 7.46484 7.14844 7.62891 7.25781C7.71094 7.3125 7.73828 7.33984 7.73828 7.36719C7.73828 7.39453 7.76562 7.44922 7.73828 7.55859C7.73828 7.64062 7.68359 7.72266 7.51953 7.80469C7.35547 7.85938 7.08203 7.88672 6.72656 7.83203C6.5625 7.80469 6.28906 7.72266 6.01562 7.64062C5.96094 7.61328 5.90625 7.58594 5.85156 7.55859C5.55078 7.47656 5.25 7.64062 5.16797 7.91406C5.05859 8.21484 5.22266 8.51562 5.49609 8.59766C5.52344 8.625 5.57812 8.625 5.63281 8.65234C5.82422 8.73438 6.17969 8.84375 6.42578 8.89844V9.0625C6.42578 9.39062 6.67188 9.63672 6.97266 9.63672C7.30078 9.63672 7.54688 9.39062 7.54688 9.0625V8.92578C7.68359 8.89844 7.82031 8.84375 7.95703 8.78906C8.39453 8.625 8.72266 8.26953 8.83203 7.75C8.85938 7.44922 8.85938 7.17578 8.75 6.92969C8.64062 6.68359 8.44922 6.51953 8.28516 6.38281C7.95703 6.13672 7.49219 6 7.16406 5.89062H7.13672C6.75391 5.78125 6.50781 5.69922 6.34375 5.58984C6.26172 5.53516 6.23438 5.50781 6.23438 5.48047C6.23438 5.48047 6.20703 5.45312 6.23438 5.34375C6.23438 5.28906 6.28906 5.20703 6.45312 5.125C6.61719 5.04297 6.89062 5.01562 7.24609 5.04297C7.35547 5.07031 7.73828 5.15234 7.82031 5.17969C8.12109 5.26172 8.42188 5.07031 8.50391 4.79688C8.58594 4.49609 8.39453 4.19531 8.12109 4.11328C7.98438 4.08594 7.71094 4.03125 7.54688 4.00391V3.8125C7.54688 3.51172 7.30078 3.26562 7 3.26562C6.67188 3.26562 6.42578 3.51172 6.42578 3.8125ZM1.3125 10.375H1.72266C2.26953 11.0859 2.95312 11.6875 3.71875 12.125H1.75V13H12.25V12.125H10.2539C11.0195 11.6875 11.7031 11.0859 12.25 10.375H12.6875C13.3984 10.375 14 10.9766 14 11.6875V13.4375C14 14.1758 13.3984 14.75 12.6875 14.75H1.3125C0.574219 14.75 0 14.1758 0 13.4375V11.6875C0 10.9766 0.574219 10.375 1.3125 10.375Z"
                                fill="#3EAEFF"
                            />
                        </svg>
                    )}
                    <span className="self-stretch my-auto leading-none">{actionText}</span>
                </button>
            )}
        </div>
    );
};


const TaskProgressCard = ({data}: { data: Profile | null }) => {
    const taskStats = [
        {value: data?.task_data?.created, label: 'Created', color: 'blue'},
        {value: data?.task_data?.progress, label: 'In Progress', color: 'amber'},
        {value: data?.task_data?.completed, label: 'Completed', color: 'green'}
    ];
    // console.log("Task progress",data)
    return (
        <div className="flex flex-col px-2 shadow-md pt-2 bg-cyan-50 rounded min-h-[124px] w-full max-w-[161px]">
            <h3 className="self-center text-base font-bold text-neutral-700">Task</h3>
            {taskStats.map(({value, label, color}) => (
                <div
                    key={label}
                    className="flex gap-3.5 justify-between items-end mt-2 w-full whitespace-nowrap"
                >
                    <div
                        className={`flex flex-col w-14 text-xs font-medium text-center text-${color}-500 rounded-3xl`}
                    >
                        <div className={`px-2 py-px rounded-3xl bg-${color}-500 bg-opacity-20`}>{value}</div>
                    </div>
                    <span className="text-xs mr-4 leading-relaxed text-zinc-600">{label}</span>
                </div>
            ))}
        </div>
    );
};

const BalanceCard: React.FC<BalanceCardProps> = ({balance,currency,exchangeRate,globalCurrency}) => (
    <div className="flex flex-col shadow-md justify-center items-center px-4 py-7 bg-rose-50 rounded min-h-[124px]">
        <div className="flex flex-col items-center">
            <div className="text-2xl font-medium leading-10 text-center text-neutral-700">
                <span>
                    {/* Rs */}
                     {/* {isNaN(parseFloat(balance)) ? '0.00' : parseFloat(balance).toFixed(2)}  */}
                     <ConvertAndFormat globalCurrency={globalCurrency} exchangeRate={exchangeRate} number={balance} currency={currency}/>

                </span>
            </div>
            <div className="text-xs text-zinc-600">Account Balance</div>
        </div>
    </div>
);


const TaskProgress: React.FC = () => {
    const [taskBooking, setTaskBooking] = useState<TaskBookingProps>()
    const [loading, setLoading] = useState(false);
    const [errro, setError] = useState("");

    const fetchEntityData = async () => {
        try {
            setLoading(true);

            const {data: fetchedTaskData} = await axiosClient.get(`${urls.booking.new_task}`,);
            if (fetchedTaskData) {
                setTaskBooking(fetchedTaskData);
            } else {
                console.warn("Received undefined or invalid data:", fetchedTaskData);
            }
        } catch (error) {
            console.error("Error fetching Task data:", error);
            setError("Failed to fetch Task");
        } finally {
            setLoading(false);
        }
    };
    // console.log("taskbooking", taskBooking)
    useEffect(() => {
        fetchEntityData();
    }, []);

    const enityId = taskBooking?.result.map(d => d.id)

    const getRandomId: any = () => {
        if (enityId && enityId.length > 0) {
            const randomIndex = Math.floor(Math.random() * enityId.length);
            return enityId[randomIndex]; // Selects a random ID
        }
        return null;
    };

    const randomId = getRandomId();
    console.log('randomid', randomId)


    const {data, isLoading} = useBookingDetail(randomId ?? enityId)


    // console.log("booking details form progress card", data)
    const progressStatus = {
        [TASK_STATUS.Initiated]: 5,
        [TASK_STATUS.Pending]: 20,
        [TASK_STATUS.Open]: 40,
        [TASK_STATUS.On_Progress]: 60,
        [TASK_STATUS.Completed]: 80,
        [TASK_STATUS.Closed]: 100,
        [TASK_STATUS.Cancelled]: 0,
    }
    const progress = progressStatus[data?.status as TASK_STATUS];

    if (isLoading) {

        return (
            <div className="relative w-full p-6 bg-white rounded-lg shadow-lg flex flex-col gap-4 mt-3">

                <Flex gap="xs" className="flex flex-wrap">
                    <Skeleton height={30} width="5%" radius="xl"/>
                    <Skeleton height={8} mt={6} width="93%" radius="xl"/>
                    <Skeleton height={8} mt={3} width="100%" radius="xl"/>
                </Flex>

            </div>
        );
    } else {
        return (
            <div className="flex flex-col w-full max-w-[750px]  mt-4">
                {data ? (
                    <div className="relative w-full p-4 bg-white rounded-md shadow-md flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="text-orange-400 text-xl">

                                    <span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                 xmlns="http://www.w3.org/2000/svg"> <path
                                d="M12.5 13.625C12.474 14.0156 12.2656 14.224 11.875 14.25H8.125C7.73438 14.224 7.52604 14.0156 7.5 13.625V11.75H0V17.375C0.0260417 17.8958 0.208333 18.3385 0.546875 18.7031C0.911458 19.0417 1.35417 19.224 1.875 19.25H18.125C18.6458 19.224 19.0885 19.0417 19.4531 18.7031C19.7917 18.3385 19.974 17.8958 20 17.375V11.75H12.5V13.625ZM18.125 4.25H15V2.375C14.974 1.85417 14.7917 1.41146 14.4531 1.04688C14.0885 0.708333 13.6458 0.526042 13.125 0.5H6.875C6.35417 0.526042 5.91146 0.708333 5.54688 1.04688C5.20833 1.41146 5.02604 1.85417 5 2.375V4.25H1.875C1.35417 4.27604 0.911458 4.45833 0.546875 4.79688C0.208333 5.16146 0.0260417 5.60417 0 6.125V10.5H20V6.125C19.974 5.60417 19.7917 5.16146 19.4531 4.79688C19.0885 4.45833 18.6458 4.27604 18.125 4.25ZM13.125 4.25H6.875V2.375H13.125V4.25Z"
                                fill="url(#paint0_linear_9430_97859)" fill-opacity="0.9"/> <defs> <linearGradient
                                id="paint0_linear_9430_97859" x1="10" y1="-2" x2="10" y2="32.8"
                                gradientUnits="userSpaceOnUse"> <stop stop-color="#FCA500"/> <stop offset="1"
                                                                                                   stop-color="#F45800"
                                                                                                   stop-opacity="0.9"/> </linearGradient> </defs>
                            </svg>
                            </span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {data.title}
                                </p>
                            </div>

                            <a
                                href={`bookings/${data?.id}`}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                View Task &gt;
                            </a>
                        </div>

                        <div className="w-full mt-2 relative">
                            <div className="h-3.5 bg-orange-100 rounded-full"
                                 style={{
                                     width: `100%`
                                 }}
                            >
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${progress}%`,
                                        background: "linear-gradient(90deg, #FFD54F 0%, #FF8A65 100%)",
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                ) : (
                    <div className="relative w-full p-6 bg-white rounded-lg shadow-lg flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-orange-500">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="transform transition-transform hover:scale-110">
                                        <path
                                            d="M12.5 13.625C12.474 14.0156 12.2656 14.224 11.875 14.25H8.125C7.73438 14.224 7.52604 14.0156 7.5 13.625V11.75H0V17.375C0.0260417 17.8958 0.208333 18.3385 0.546875 18.7031C0.911458 19.0417 1.35417 19.224 1.875 19.25H18.125C18.6458 19.224 19.0885 19.0417 19.4531 18.7031C19.7917 18.3385 19.974 17.8958 20 17.375V11.75H12.5V13.625ZM18.125 4.25H15V2.375C14.974 1.85417 14.7917 1.41146 14.4531 1.04688C14.0885 0.708333 13.6458 0.526042 13.125 0.5H6.875C6.35417 0.526042 5.91146 0.708333 5.54688 1.04688C5.20833 1.41146 5.02604 1.85417 5 2.375V4.25H1.875C1.35417 4.27604 0.911458 4.45833 0.546875 4.79688C0.208333 5.16146 0.0260417 5.60417 0 6.125V10.5H20V6.125C19.974 5.60417 19.7917 5.16146 19.4531 4.79688C19.0885 4.45833 18.6458 4.27604 18.125 4.25ZM13.125 4.25H6.875V2.375H13.125V4.25Z"
                                            fill="url(#paint0_linear_9430_97859)" fillOpacity="0.9"/>
                                        <defs>
                                            <linearGradient
                                                id="paint0_linear_9430_97859"
                                                x1="10"
                                                y1="-2"
                                                x2="10"
                                                y2="32.8"
                                                gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#FCA500"/>
                                                <stop offset="1" stopColor="#F45800" stopOpacity="0.9"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <p className="text-sm font-semibold text-gray-900">BOOKED TASK PROGRESS WILL
                                        DISPLAYED
                                        HERE!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                )}

            </div>
        );
    }


};


export default TaskStats;
