'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Title, Text, Button, Alert, Loader, Paper, Center } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import apiClient from "@/axiosConfig";

export default function VerifyEmail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const uuid = searchParams.get('u');
    const token = searchParams.get('t');

    useEffect(() => {
        if (!uuid || !token) {
            setStatus('error');
            setErrorMessage('Invalid verification link. Missing UUID or token.');
        }
    }, [uuid, token]);

    const handleVerify = async () => {
        if (!uuid || !token) return;

        setStatus('loading');
        try {
            const response = await apiClient.post(`/account/verify/${uuid}/${token}/`, { uuid, token });

            if (response.status === 200) {
                setStatus('success');
                setTimeout(() => router.push('/login?from=email'), 2000);
            } else {
                setStatus('error');
                setErrorMessage(response.data.message || 'Verification failed. Please try again.');
            }
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'An error occurred during verification.');
        }
    };

    return (
        <Container size="xs" my={40} className=" min-h-screen  ">
            <div className="flex justify-center items-center" >
                <img
                    src={"/assets/logo.png"}
                 alt={"logo"}/>

            </div>

            <Paper radius="md" p="xl" >
                <Title order={2} ta="center" mb="md">
                    Email Verification
                </Title>

                {status === 'idle' && (
                    <>
                        <Text ta="center" mb="md">
                            Click the button below to verify your email address.
                        </Text>
                        <Button
                            fullWidth
                            onClick={handleVerify}
                            disabled={!uuid || !token}
                            size="md"
                        >
                            Verify Email
                        </Button>
                    </>
                )}

                {status === 'loading' && (
                    <Center>
                        <Loader size="lg" />
                    </Center>
                )}

                {status === 'success' && (
                    <Alert icon={<IconCheck size={20} />} title="Success!" color="green" radius="md">
                        Email verified successfully! Redirecting to login...
                    </Alert>
                )}

                {status === 'error' && (
                    <Alert icon={<IconX size={20} />} title="Error" color="red" radius="md">
                        {errorMessage}
                    </Alert>
                )}
            </Paper>
        </Container>
    );
}