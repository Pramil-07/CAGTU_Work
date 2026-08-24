import { Table, Text, Button, Checkbox, Flex, Image, Tooltip, ActionIcon, Box, Collapse } from '@mantine/core';
import { Key, useEffect, useState } from 'react';
import { IconX, IconTrash, IconAlertCircle, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useBoxStyles } from '@/styles/pages/BoxStyles';
import type { MyBookingProps } from '@/types/booking/MyBookingProps';
import type { CartProps } from '@/types/box/CartProps';
import { convertTo12HourFormat } from '@/utils/formatTime';
import { CancelModal } from '../common/CancelModal';
import { axiosClient } from '@/utils/axiosClient';
import ConvertAndFormat from '../CurrencyNumberFormatter/ConvertAndFormat';
import { useCurrency } from '@/currency/CurrencyContext';
import { bo } from '@fullcalendar/core/internal-common';

type OrderItem = {
    id?: string | number;
    entity_service: {
        title: string;
        created_by: {
            full_name: string;
        };
        images: Array<{ media: string }>;
        is_online: boolean;
        location: string;
        currency: {
            symbol: string;
            code:string
        };
    };
    start_date?: string;
    end_date?: string;
    price: string;
    currency: {
        symbol: string;
        code:string;
    };
    booking?: number;
    status?: string;
    earning?: string;
};

type BookingItem = {
    id?: string | number;
    entity_service: {
        title: string;
        created_by: {
            full_name: string;
        };
        images: Array<{ media: string }>;
        is_online: boolean;
        location: string;
        currency: {
            symbol: string;
            code: string;
        };
        is_requested?: boolean;
    };
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    price: string;
    currency: {
        symbol: string;
        code: string;
    };
    booking?: number;
    status?: string;
    earning?: string;
};

interface BoxCardProps {
    orderData?: OrderItem[];
    bookingData?: BookingItem[];
    items?: string[];
    setItems?: React.Dispatch<React.SetStateAction<string[]>>;
    selectedCurrency?: string | null;
    setSelectedCurrency?: React.Dispatch<React.SetStateAction<string | null>>;
    truncateName: (name: string | undefined) => string;
}

const BoxCard = ({
                     orderData,
                     bookingData,
                     items,
                     setItems,
                     selectedCurrency,
                     setSelectedCurrency,
                     truncateName,
                 }: BoxCardProps) => {
    const { classes } = useBoxStyles();
    const router = useRouter();
    const [cancelModal, setCancelModal] = useState(false);
    const [selectedItemForCancel, setSelectedItemForCancel] = useState<OrderItem | BookingItem | null>(null);
    const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});
    const{globalCurrency}= useCurrency();
       const [exchangeInfo, setExchangeInfo] = useState<number>(89.0);
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
        console.log("selected currency from box card",setSelectedCurrency);

    const showCurrencyErrorNotification = () => {
        notifications.show({
            title: 'Currency Mismatch',
            message: 'You cannot select items with different currencies in the cart.',
            color: 'red',
            icon: <IconX size={16} />,
            autoClose: 3000,
            style: { position: 'fixed', top: '60px',right: "20px", boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        });
    };

    const showExpiredNotification = () => {
        notifications.show({
            title: 'Expired Item',
            message: 'This task/service has expired and cannot be purchased.',
            color: 'red',
            icon: <IconX size={16} />,
            autoClose: 3000,
            style: { position: 'fixed', top: '60px',right: "20px", boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        });
    };

    const showSuccessNotification = (message: string) => {
        notifications.show({
            title: 'Success',
            message,
            color: 'green',
            icon: <IconX size={16} />,
            autoClose: 3000,
            style: { position: 'fixed', top: '60px',right: "20px", boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        });
    };

    const showErrorNotification = (message: string) => {
        notifications.show({
            title: 'Error',
            message,
            color: 'red',
            icon: <IconX size={16} />,
            autoClose: 3000,
            style: { position: 'fixed', top: '60px',right: "20px", boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        });
    };

    const isDeadlineNear = (startDate: string | undefined, endDate: string | undefined, endTime: string | undefined): boolean => {
        if (!endDate) return false;
        const currentTime = new Date().getTime();
        if (endTime) {
            const endDateTime = new Date(`${endDate}T${endTime}`).getTime();
            const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
            return endDateTime > currentTime && endDateTime <= currentTime + twoDaysInMs;
        }
        const endDateTime = new Date(endDate).getTime();
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
        return endDateTime > currentTime && endDateTime <= currentTime + twoDaysInMs;
    };

    const isItemExpired = (startDate: string | undefined, endDate: string | undefined, endTime: string | undefined): boolean => {
        if (!endDate) return false;
        if (!endTime) {
            return new Date(endDate).getTime() + 2 * 24 * 60 * 60 * 1000 < new Date().getTime();
        }
        const endDateTime = new Date(`${endDate}T${endTime}`);
        return endDateTime.getTime() < new Date().getTime();
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (setItems && items && id) {
            const item = orderData?.find((item) => item.id === id);
            if (item && isItemExpired(item.start_date, item.end_date, undefined)) {
                showExpiredNotification();
                return;
            }
            const itemCurrency = item?.currency?.code|| 'NRS';
            if (selectedCurrency && selectedCurrency !== itemCurrency) {
                showCurrencyErrorNotification();
                return;
            }
            if (event.target.checked) {
                setItems([...items, id]);
                if (!selectedCurrency) {
                    setSelectedCurrency?.(itemCurrency);
                }
            } else {
                setItems(items.filter((item) => item !== id));
                if (items.length === 1) {
                    setSelectedCurrency?.(null);
                }
            }
        }
    };
  if (bookingData){
    console.log(bookingData,"booking data from waiting list" );
  }

    const handleBulkDelete = () => {
        modals.openConfirmModal({
            title: 'Delete Selected Items',
            children: (
                <div className="text-sm">
                    <p>Are you sure you want to delete {items?.length} selected item(s) from your Payment list?</p>
                    <p className="mt-2 text-gray-500">This action cannot be undone.</p>
                </div>
            ),
            labels: {confirm: 'Delete', cancel: 'Cancel'},
            confirmProps: {color: 'red'},
            onConfirm: async () => {
                try {
                    for (const id of items || []) {
                        await axiosClient.post(`product/cart/update-quantity/`, {
                            cart_id: id,
                            action: 'cancel',
                        });
                    }
                    setItems?.([]);
                    setSelectedCurrency?.(null);
                    showSuccessNotification('Selected items deleted successfully.');
                    window.location.reload();
                } catch (error) {
                    showErrorNotification('Failed to delete selected items. Please try again.');
                }
            },
        });
    };

    const handleCancelClick = (item: OrderItem | BookingItem) => {
        setSelectedItemForCancel(item);
        setCancelModal(true);
    };

    const renderStatus = (status?: string) => {
        switch (status) {
            case 'cancelled':
                return <Text fz="sm" c="red.8">Cancelled</Text>;
            case 'pending':
                return <Text fz="sm" c="yellow.7">Pending</Text>;
            case 'rejected':
                return <Text fz="sm" c="red.5">Rejected</Text>;
            default:
                return orderData ? <Text fz="sm" c="blue">Approved</Text> : <Text fz="sm" c="gray">Waiting</Text>;
        }
    };

    const groupedData = (orderData || bookingData)?.reduce((acc, item) => {
        const key = `${item.entity_service?.title}-${item.entity_service?.created_by?.full_name}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as { [key: string]: (OrderItem | BookingItem)[] });

    const dataToRender = orderData || bookingData || [];

    return (
        <Box sx={{overflowX: 'auto'}}>
            <Table highlightOnHover striped sx={{minWidth: 700}}>
                <thead>
                <tr>
                    {orderData && (
                        <th style={{width: '50px'}}>
                            {items && items.length > 0 && (
                                <ActionIcon variant="transparent" color="red" onClick={handleBulkDelete}>
                                    <IconTrash size={16}/>
                                </ActionIcon>
                            )}
                        </th>
                    )}
                    <th style={{width: '5%'}}>Service/Task</th>
                    <th style={{width: '20%'}}>Title</th>
                    <th style={{width: '15%'}}>Provider</th>
                    <th style={{width: '15%'}}>Location</th>
                    <th style={{width: '13%'}}>Date</th>
                    <th style={{width: '14%'}}>Price</th>
                    <th style={{width: '10%'}}>Status</th>
                    <th style={{width: '13%'}}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {dataToRender.map((item: any, index) => {
                    const key = `${item.entity_service?.title}-${item.entity_service?.created_by?.full_name}`;
                    const group = groupedData?.[key];
                    const isGrouped = group && group.length > 1;
                    const isFirstInGroup = isGrouped && group.indexOf(item) === 0;
                    console.log(item.entity_service.currency?.code, "currency code from box card");
                    console.log(item.entity_service?.ea, "currency symbol from box card");

                    if (isGrouped && isFirstInGroup) {
                        const isOpen = openRows[key];
                        const totalPrice = group
                            .reduce((sum, item) => sum + (parseFloat(item.price || '0') || 0), 0)
                            .toFixed(2);
                        const earliestDate = group.reduce((earliest, item) => {
                            if (!earliest || !item.end_date) return item.end_date;
                            if (!earliest) return item.end_date;
                            return new Date(item.end_date) < new Date(earliest) ? item.end_date : earliest;
                        }, group[0]?.end_date);

                        return (
                            <>
                                <tr
                                    key={index}
                                    onClick={() => setOpenRows({ ...openRows, [key]: !isOpen })}
                                    style={{ cursor: 'pointer' }}
                                    className={classes.tableRow}
                                >
                                    {orderData && (
                                        <td>
                                            <Checkbox
                                                radius="lg"
                                                disabled={group.some((item) =>
                                                    isItemExpired(
                                                        item.start_date,
                                                        item.end_date,
                                                        'start_time' in item ? (item as BookingItem).end_time : undefined
                                                    )
                                                )}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        const validItems = group.filter(
                                                            (item) =>
                                                                !isItemExpired(
                                                                    item.start_date,
                                                                    item.end_date,
                                                                    'start_time' in item ? (item as BookingItem).end_time : undefined
                                                                )
                                                        );
                                                        setItems?.([
                                                            ...(items || []),
                                                            ...validItems
                                                                .map((item) => item.id)
                                                                .filter((id) => id) as string[],
                                                        ]);
                                                    } else {
                                                        setItems?.(
                                                            items?.filter((id) => !group.some((item) => item.id === id)) || []
                                                        );
                                                    }
                                                }}
                                                checked={group
                                                    .filter((item) =>
                                                        !isItemExpired(
                                                            item.start_date,
                                                            item.end_date,
                                                            'start_time' in item ? (item as BookingItem).end_time : undefined
                                                        )
                                                    )
                                                    .every((item) => items?.includes(item.id as string))}
                                            />
                                        </td>
                                    )}
                                    <td>
                                        <Flex align="center" gap="xs">
                                            <Image
                                                src={item.entity_service?.images[0]?.media ?? '/images/placeholder/taskPlaceholder.png'}
                                                height={50}
                                                width={50}
                                                style={{ objectFit: 'cover', borderRadius: '4px' }}
                                                alt="servicecard-image"
                                            />
                                        </Flex>
                                    </td>
                                    <td>
                                        <Text fz={{ base: 'xs', sm: 'sm' }}>{truncateName(item.entity_service?.title)}</Text>
                                    </td>
                                    <td>
                                        <Text fz={{ base: 'xs', sm: 'sm' }}>
                                            {truncateName(item.entity_service?.created_by?.full_name)}
                                        </Text>
                                    </td>
                                    <td>
                                        <Tooltip
                                            label={item.entity_service?.is_online ? 'Remote' : item.entity_service?.location}
                                            position="top"
                                            withArrow
                                        >
                                            <Text fz={{ base: 'xs', sm: 'sm' }}>
                                                {truncateName(item.entity_service?.is_online ? 'Remote' : item.entity_service?.location)}
                                            </Text>
                                        </Tooltip>
                                    </td>
                                    <td>
                                        <Text fz={{ base: 'xs', sm: 'sm' }}>
                                            {earliestDate && format(new Date(earliestDate), 'PP')}
                                        </Text>
                                    </td>
                                    <td>
                                        <Text fz={{ base: 'xs', sm: 'sm' }}>
                                            {/* {(item.currency?.symbol || 'NRS')} {totalPrice} */}
                                            <ConvertAndFormat number={Number(totalPrice)} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={item.currency?.code||item.entity_service.currency.code}/>
                                        </Text>
                                    </td>
                                    <td>{renderStatus(item.status)}</td>
                                    <td>
                                        <ActionIcon onClick={() => setOpenRows({...openRows, [key]: !isOpen})}>
                                            {isOpen ? <IconChevronUp size={16}/> : <IconChevronDown size={16}/>}
                                        </ActionIcon>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={9} style={{padding: 0, border: 'none'}}>
                                        <Collapse in={isOpen}>
                                            <Table sx={{margin: 0}}>
                                                <tbody>
                                                {group.map((subItem, subIndex) => {
                                                    const isBookingItem = 'start_time' in subItem;
                                                    const isExpired = isItemExpired(
                                                        subItem.start_date,
                                                        subItem.end_date,
                                                        isBookingItem ? (subItem as BookingItem).end_time : undefined
                                                    );
                                                    const isLast = subIndex === group.length - 1;
                                                    const prefix = isLast ? '└── ' : '├── ';
                                                   if (bookingData) {
                                                       console.log(subItem.currency?.code, "currency code from box card");
                                                         console.log(subItem.currency, "currency symbol from box card");
                                                }


                                                    return (
                                                        <tr key={subIndex} className={classes.tableRow} onClick={bookingData && subItem.id ? () => router.push(`/box/${subItem.id}`) : undefined} style={bookingData && subItem.id ? { cursor: 'pointer' } : {}}>
                                                            {orderData && (
                                                                <td>
                                                                    <Checkbox
                                                                        radius="lg"
                                                                        disabled={isExpired}
                                                                        onChange={(e) => handleChange(e, subItem.id as string)}
                                                                        checked={items?.includes(subItem.id as string) || false}
                                                                    />
                                                                </td>
                                                            )}
                                                            <td>
                                                                <Flex justify="end">
                                                                    <Text
                                                                        fz={{ base: 'xs', sm: 'sm' }}
                                                                        style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}
                                                                    >
                                                                        {prefix}
                                                                    </Text>
                                                                    <Image
                                                                        src={
                                                                            subItem.entity_service?.images[0]?.media ??
                                                                            '/images/placeholder/taskPlaceholder.png'
                                                                        }
                                                                        height={40}
                                                                        width={40}
                                                                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                                                                        alt="servicecard-image"
                                                                    />
                                                                </Flex>
                                                            </td>
                                                            <td>
                                                                <Flex justify="center">
                                                                    <Text fz={{ base: 'xs', sm: 'sm' }}>
                                                                        {truncateName(subItem.entity_service?.title)}
                                                                    </Text>
                                                                </Flex>
                                                            </td>
                                                            <td>
                                                                <Flex justify="center">
                                                                    <Text fz={{ base: 'xs', sm: 'sm' }}>
                                                                        {truncateName(subItem.entity_service?.created_by?.full_name)}
                                                                    </Text>
                                                                </Flex>
                                                            </td>
                                                            <td>
                                                                <Flex justify="center">
                                                                    <Tooltip
                                                                        label={
                                                                            subItem.entity_service?.is_online
                                                                                ? 'Remote'
                                                                                : subItem.entity_service?.location
                                                                        }
                                                                        position="top"
                                                                        withArrow
                                                                    >
                                                                        <Text fz={{ base: 'xs', sm: 'sm' }}>
                                                                            {truncateName(
                                                                                subItem.entity_service?.is_online
                                                                                    ? 'Remote'
                                                                                    : subItem.entity_service?.location
                                                                            )}
                                                                        </Text>
                                                                    </Tooltip>
                                                                </Flex>
                                                            </td>
                                                            <td>
                                                                <Flex justify="start">
                                                                    <Text fz={{ base: 'xs', sm: 'sm' }}>
                                                                        {subItem.end_date && format(new Date(subItem.end_date), 'PP')}
                                                                        {isBookingItem && (subItem as BookingItem).start_time && (
                                                                            <Text fz="xs" c="gray">
                                                                                {convertTo12HourFormat(
                                                                                    (subItem as BookingItem).start_time || ''
                                                                                )}{' '}
                                                                                -{' '}
                                                                                {convertTo12HourFormat(
                                                                                    (subItem as BookingItem).end_time || ''
                                                                                )}
                                                                            </Text>
                                                                        )}
                                                                    </Text>
                                                                </Flex>
                                                            </td>
                                                            <td>
                                                                <Text fz={{ base: 'xs', sm: 'sm' }}>
                                                                    {/* {(subItem.currency?.symbol ||
                                                                        subItem.entity_service?.currency?.symbol ||
                                                                        'NRS')}{' '} */}
                                                                    {isBookingItem && (subItem as BookingItem).entity_service?.is_requested
                                                                        ?
                                                                        // (subItem.earning && parseFloat(subItem.earning).toFixed(2)) ||
                                                                        // '0.00'
                                                                        <ConvertAndFormat number={Number(subItem.earning )} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={subItem.currency?.code || subItem.entity_service?.currency?.code }/>
                                                                        :<ConvertAndFormat number={Number(subItem.price )} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={subItem.currency?.code || subItem.entity_service?.currency?.code }/>
                                                                        //  (subItem.price && parseFloat(subItem.price).toFixed(2)) || '0.00'
                                                                        }
                                                                </Text>
                                                            </td>
                                                            <td>{renderStatus(subItem.status)}</td>
                                                            <td>
                                                                {(subItem.status === 'pending' || orderData) && (
                                                                    <Button
                                                                        size="xs"
                                                                        variant="outline"
                                                                        color="red"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCancelClick(subItem);
                                                                        }}
                                                                        ml={8}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </Table>
                                        </Collapse>
                                    </td>
                                </tr>
                                {orderData &&
                                    group.some((item) =>
                                        isItemExpired(
                                            item.start_date,
                                            item.end_date,
                                            (item as BookingItem).end_time
                                        )
                                    ) && (
                                        <tr>
                                            <td colSpan={9}>
                                                <Text
                                                    c="orange.6"
                                                    fz="sm"
                                                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                                >
                                                    <IconAlertCircle size={16} />
                                                    Payment deadline has passed for some items.
                                                </Text>
                                            </td>
                                        </tr>
                                    )}
                                {orderData &&
                                    group.some((item) =>
                                        isDeadlineNear(
                                            item.start_date,
                                            item.end_date,
                                            (item as BookingItem).end_time
                                        )
                                    ) &&
                                    !group.some((item) =>
                                        isItemExpired(
                                            item.start_date,
                                            item.end_date,
                                            (item as BookingItem).end_time
                                        )
                                    ) && (
                                        <tr>
                                            <td colSpan={9}>
                                                <Text
                                                    c="orange.6"
                                                    fz="sm"
                                                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                                >
                                                    <IconAlertCircle size={16} />
                                                    Payment deadline is near for some items.
                                                </Text>
                                            </td>
                                        </tr>
                                    )}
                            </>
                        );
                    } else if (!isGrouped) {
                        const isBookingItem = 'start_time' in item;

                        return (
                            <tr
                                key={index}
                                onClick={bookingData && item.id ? () => router.push(`/box/${item.id}`) : undefined}
                                style={bookingData && item.id ? { cursor: 'pointer' } : {}}
                                className={classes.tableRow}
                            >
                                {orderData && (
                                    <td>
                                        <Checkbox
                                            radius="lg"
                                            disabled={isItemExpired(item.start_date, item.end_date, undefined)}
                                            onChange={(e) => handleChange(e, item.id as string)}
                                            checked={items?.includes(item.id as string)}
                                        />
                                    </td>
                                )}
                                <td>
                                    <Flex align="center" gap="xs">
                                        <Image
                                            src={item.entity_service?.images[0]?.media ?? '/images/placeholder/taskPlaceholder.png'}
                                            height={50}
                                            width={50}
                                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                                            alt="servicecard-image"
                                        />
                                    </Flex>
                                </td>
                                <td>
                                    <Text className="justify-start" fz={{ base: 'xs', sm: 'sm' }}>
                                        {truncateName(item.entity_service?.title)}
                                    </Text>
                                </td>
                                <td>
                                    <Text fz={{ base: 'xs', sm: 'sm' }}>
                                        {truncateName(item.entity_service?.created_by?.full_name)}
                                    </Text>
                                </td>
                                <td>
                                    <Tooltip
                                        label={item.entity_service?.is_online ? 'Remote' : item.entity_service?.location}
                                        position="top"
                                        withArrow
                                    >
                                        <Text fz={{ base: 'xs', sm: 'sm' }}>
                                            {truncateName(item.entity_service?.is_online ? 'Remote' : item.entity_service?.location)}
                                        </Text>
                                    </Tooltip>
                                </td>
                                <td>
                                    <Text fz={{ base: 'xs', sm: 'sm' }}>
                                        {item.end_date && format(new Date(item.end_date), 'PP')}
                                        {isBookingItem && (item as BookingItem).start_time && (
                                            <Text fz="xs" c="gray">
                                                {convertTo12HourFormat((item as BookingItem).start_time || '')} -{' '}
                                                {convertTo12HourFormat((item as BookingItem).end_time || '')}
                                            </Text>
                                        )}
                                    </Text>
                                </td>
                                <td>
                                    <Text fz={{ base: 'xs', sm: 'sm' }}>
                                        {/* {(item.currency?.symbol || item.entity_service?.currency?.symbol || 'NRS')}{' '} */}
                                        {isBookingItem && (item as BookingItem).entity_service?.is_requested
                                            ? <ConvertAndFormat number={ Number (item.earning ) || '0.00'} exchangeRate={exchangeInfo} globalCurrency={globalCurrency} currency={item.currency?.code || item.entity_service?.currency?.code }/>
                                            : <ConvertAndFormat number={Number(item.price) || '0.00'} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={item.currency?.code || item.entity_service?.currency?.code }/>
                                        }
                                    </Text>
                                </td>
                                <td>{renderStatus(item.status)}</td>
                                <td>
                                    {(item.status === 'pending' || orderData) && (
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            color="red"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancelClick(item);
                                            }}
                                            ml={8}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        );
                    }
                    return null;
                })}
                </tbody>
            </Table>

            {/* Render CancelModal outside of the map loop */}
            {cancelModal && selectedItemForCancel && (
                <CancelModal
                    is_client={bookingData ? !(selectedItemForCancel as BookingItem).entity_service?.is_requested : false}
                    state="beforeApprove"
                    id={orderData ? selectedItemForCancel.booking?.toString() || selectedItemForCancel.id : selectedItemForCancel.id}
                    opened={cancelModal}
                    setOpened={setCancelModal}
                />
            )}
        </Box>
    );
};

export default BoxCard;
