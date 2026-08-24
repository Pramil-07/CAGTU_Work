import React from 'react';
import {Card, Text, Grid, Box, Button} from '@mantine/core';

interface OrderCardProps {
    orderId: string;
    ordered: boolean;
    discount?: string;
    createdAt?: string;
    billingAddress?: string;
    paymentMethod?: string;
    deliveredDate?: string;
    couponName?: string;
    orderStatus?: string;
    isPaid: boolean;
    couponUsed: boolean;
    totalPrice?: string;
    handleStatusChange?:()=>void
}

const OrderCard: React.FC<OrderCardProps> = ({
                                                 orderId,
                                                 ordered,
                                                 discount,
                                                 createdAt,
                                                 billingAddress,
                                                 paymentMethod,
                                                 deliveredDate,
                                                 couponName,
                                                 orderStatus,
                                                 isPaid,
                                                 couponUsed,
                                                 totalPrice,handleStatusChange
                                             }) => {
    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            style={{
                width: '100%',
                margin: '0 auto',
            }}
        >
            <Text
                size="xl"
                style={{ marginBottom: '20px', textAlign: 'left', fontWeight: '600' }}
            >
                Order Details
            </Text>
            <Box
                style={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #e0e0e0',
                    width: '100%',
                    margin: '0 auto',
                    padding: '18px',
                    borderRadius: '10px'
                }}
            >
                <Grid>
                    <Grid.Col span={6}>
                        {/*<div style={{ marginBottom: '15px' }}>*/}
                        {/*    <Text style={{ fontWeight: '500', display: 'inline' }}>Order ID:</Text>*/}
                        {/*    <Text style={{ display: 'inline' }}> {orderId || 'none'}</Text>*/}
                        {/*</div>*/}
                        <div style={{ marginBottom: '15px' }}>
                            <Text style={{ fontWeight: '500', display: 'inline' }}>Created At:</Text>
                            <Text style={{ display: 'inline' }}> {createdAt || 'none'}</Text>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <Text style={{ fontWeight: '500', display: 'inline' }}>Delivered Date:</Text>
                            <Text style={{ display: 'inline' }}> {deliveredDate || 'none'}</Text>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <Text style={{ fontWeight: '500', display: 'inline' }}>Paid:</Text>
                            <Text style={{ display: 'inline' }}> {isPaid ? 'Yes' : 'No'}</Text>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <Text style={{ fontWeight: '500', display: 'inline' }}>Ordered:</Text>
                            <Text style={{ display: 'inline' }}> {ordered ? 'Yes' : 'No'}</Text>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <Text style={{ fontWeight: '500', display: 'inline' }}>Discount:</Text>
                            <Text style={{ display: 'inline' }}> {discount || 'none'}</Text>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <Text style={{ fontWeight: '500', display: 'inline' }}>Order Status:</Text>
                            <Text style={{ display: 'inline' }}> {orderStatus || 'none'}</Text>

                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <Text style={{ fontWeight: '500', display: 'inline' }}>Total Price:</Text>
                            <Text style={{ display: 'inline' }}> AU$ {totalPrice || 'none'}</Text>
                        </div>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        {/*<div style={{ marginBottom: '15px' }}>*/}
                        {/*    <Text style={{ fontWeight: '500', display: 'inline' }}>Billing Address:</Text>*/}
                        {/*    <Text style={{ display: 'inline' }}> {billingAddress || 'none'}</Text>*/}
                        {/*</div>*/}
                        <div style={{ marginBottom: '15px' }}>
                            <Text style={{ fontWeight: '500', display: 'inline' }}>Payment Method:</Text>
                            <Text style={{ display: 'inline' }}> {paymentMethod || 'none'}</Text>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <Text style={{ fontWeight: '500', display: 'inline' }}>Coupon Name:</Text>
                            <Text style={{ display: 'inline' }}> {couponName || 'none'}</Text>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <Text style={{ fontWeight: '500', display: 'inline' }}>Coupon Used:</Text>
                            <Text style={{ display: 'inline' }}> {couponUsed ? 'Yes' : 'No'}</Text>
                        </div>
                    </Grid.Col>
                    <Button onClick={handleStatusChange}>Change Status</Button>

                </Grid>
            </Box>
        </Card>
    );
};

export default OrderCard;