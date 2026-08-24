'use client';

import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { PasswordInput, Button, Group, Box, Title, Paper, List, Text } from '@mantine/core';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/axiosConfig';
import { useRouter } from 'next/navigation'; // For redirecting if needed

export default function ChangePasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // State for error message
    const searchParams = useSearchParams();
    const router = useRouter(); // For redirecting
    const uuid = searchParams.get('u');
    const token = searchParams.get('t');

    // Check for missing uuid or token on component mount
    useEffect(() => {
        if (!uuid || !token) {
            setError('Invalid or missing reset link. Please check your email or request a new password reset link from forgot password.');
            notifications.show({
                title: 'Error',
                message: 'Invalid or missing reset link.',
                color: 'red',
            });
        }
    }, [uuid, token]);

    // Mantine form hook with validation
    const form = useForm({
        initialValues: {
            newPassword: '',
            confirmPassword: '',
        },
        validate: {
            newPassword: (value) =>
                value.length < 8 ? 'New password must be at least 8 characters' : null,
            confirmPassword: (value, values) =>
                value !== values.newPassword ? 'Passwords do not match' : null,
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        if (!uuid || !token) {
            notifications.show({
                title: 'Error',
                message: 'Cannot proceed without a valid reset link.',
                color: 'red',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post(`/account/customer/reset-password/${uuid}/${token}/`, {
                new_password1: values.newPassword,
                new_password2: values.confirmPassword,
            });

            notifications.show({
                title: 'Success',
                message: 'Password changed successfully!',
                color: 'green',
            });

            form.reset();
            // Optionally redirect to login page after success
            router.push('/login');
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to change password. Please try again or request a new link.',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const requirements = [
        { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
        { label: 'At least one uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
        { label: 'At least one lowercase letter', test: (value: string) => /[a-z]/.test(value) },
        { label: 'At least one number', test: (value: string) => /\d/.test(value) },
        { label: 'At least one special character', test: (value: string) => /[!@#$%^&*]/.test(value) },
    ];

    // Render error message if uuid or token is missing
    if (error) {
        return (
            <Box className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <Paper radius="lg" p="xl" withBorder className="shadow-lg bg-white max-w-md">
                    <Title order={2} className="text-center mb-6 text-gray-800">
                        Error
                    </Title>
                    <Text color="red" className="text-center mb-6">
                        {error}
                    </Text>
                    <Button
                        fullWidth
                        className="bg-blue-600 hover:bg-blue-700 transition-colors"
                        onClick={() => router.push('/login?from=resetPassword')} // Redirect to password reset request page
                    >
                        Request New Reset Link
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Left Section: Form and Requirements */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-md space-y-6">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <img
                            src="/assets/logo.png"
                            alt="Logo"
                            className="w-24 h-24 md:w-32 md:h-32 object-contain"
                        />
                    </div>

                    {/* Form Paper */}
                    <Paper radius="lg" p="xl" withBorder className="shadow-lg bg-white">
                        <Title order={2} className="text-center mb-6 text-gray-800">
                            Change Password
                        </Title>

                        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                            <PasswordInput
                                label="New Password"
                                placeholder="Enter new password"
                                required
                                {...form.getInputProps('newPassword')}
                                className="w-full"
                            />

                            <PasswordInput
                                label="Confirm New Password"
                                placeholder="Confirm new password"
                                required
                                {...form.getInputProps('confirmPassword')}
                                className="w-full"
                            />

                            <Group justify="center" mt="xl">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    fullWidth
                                    className="bg-blue-600 hover:bg-blue-700 transition-colors"
                                    disabled={!uuid || !token} // Disable button if uuid or token is missing
                                >
                                    {loading ? 'Changing Password...' : 'Change Password'}
                                </Button>
                            </Group>
                        </form>
                    </Paper>

                    {/* Requirements Paper */}
                    <Paper radius="lg" p="xl" withBorder className="shadow-lg bg-white">
                        <Title order={4} className="text-center mb-4 text-gray-700">
                            Password Requirements
                        </Title>
                        <List spacing="xs" size="sm" center>
                            {requirements.map((req, index) => {
                                const isValid = req.test(form.values.newPassword);
                                return (
                                    <List.Item
                                        key={index}
                                        icon={
                                            isValid ? (
                                                <IconCheck size={16} color="green" />
                                            ) : (
                                                <IconX size={16} color="red" />
                                            )
                                        }
                                        className={isValid ? 'text-green-600' : 'text-red-600'}
                                    >
                                        {req.label}
                                    </List.Item>
                                );
                            })}
                        </List>
                    </Paper>
                </div>
            </div>

            {/* Right Section: Image */}
            <div
                className="hidden md:block w-full md:w-1/2 bg-cover bg-center"
                style={{ backgroundImage: 'url(/assets/change-password-bg.jpg)' }}
            >
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <img
                        src="/assets/unnamed.jpg"
                        alt="Background"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.style.backgroundColor = '#e5e7eb';
                        }}
                    />
                </div>
            </div>
        </Box>
    );
}