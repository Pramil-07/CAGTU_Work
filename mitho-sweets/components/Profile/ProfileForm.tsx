"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    Container,
    Paper,
    Title,
    TextInput,
    Textarea,
    Button,
    Group,
    Stack,
    Grid,
    Select,
    FileInput,
    Avatar,
    Alert,
    Box,
    Card,
    Divider,
    Badge,
    ActionIcon,
    Switch,
    Text,
} from "@mantine/core"
import {
    IconUser,
    IconMail,
    IconPhone,
    IconMapPin,
    IconUpload,
    IconCheck,
    IconX,
    IconAlertCircle,
    IconArrowLeft,
    IconDeviceFloppy,
    IconUserPlus,
    IconEdit,
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import apiClient from "@/axiosConfig"
import { useUser } from "@/hooks/useUser"
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";

// Updated Types to match API structure
interface Address {
    street_address: string
    postal_code: string
    city: string
    state: string
    country: string
}

interface ProfileFormData {
    id?: string
    first_name: string
    last_name: string
    email: string
    phone: string
    address: Address[]
    profile_image: File | string | null
    preferences?: {
        emailNotifications: boolean
        smsNotifications: boolean
        marketingEmails: boolean
        newsletter: boolean
    }
    socialMedia?: {
        twitter?: string
        linkedin?: string
        instagram?: string
    }
}

// API Functions
async function createProfile(profileData: ProfileFormData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const formData = new FormData()

        // Append basic fields
        formData.append('first_name', profileData.first_name)
        formData.append('last_name', profileData.last_name)
        formData.append('email', profileData.email)
        formData.append('phone', profileData.phone)

        // Handle profile image
        if (profileData.profile_image instanceof File) {
            formData.append('profile_image', profileData.profile_image)
        }

        // Handle address array - send as JSON string
        if (profileData.address && profileData.address.length > 0) {
            formData.append('address', JSON.stringify(profileData.address))
        }

        // Handle preferences and social media if they exist
        if (profileData.preferences) {
            formData.append('preferences', JSON.stringify(profileData.preferences))
        }
        if (profileData.socialMedia) {
            formData.append('socialMedia', JSON.stringify(profileData.socialMedia))
        }

        const response = await apiClient.post("/account/customer/profile/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        return {
            success: true,
            data: response.data,
        }
    } catch (error: any) {
        console.error("Error creating profile:", error)
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Failed to create profile",
        }
    }
}

async function updateProfile(profileData: ProfileFormData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const formData = new FormData()

        // Append basic fields
        formData.append('first_name', profileData.first_name)
        formData.append('last_name', profileData.last_name)
        formData.append('email', profileData.email)
        formData.append('phone', profileData.phone)

        // Handle profile image
        if (profileData.profile_image instanceof File) {
            formData.append('profile_image', profileData.profile_image)
        }

        // Handle address array - send as JSON string
        if (profileData.address && profileData.address.length > 0) {
            formData.append('address', JSON.stringify(profileData.address))
        }

        // Handle preferences and social media if they exist
        if (profileData.preferences) {
            formData.append('preferences', JSON.stringify(profileData.preferences))
        }
        if (profileData.socialMedia) {
            formData.append('socialMedia', JSON.stringify(profileData.socialMedia))
        }

        const response = await apiClient.patch("/account/customer/profile/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        console.log("edit profile data", formData)

        return {
            success: true,
            data: response.data,
        }
    } catch (error: any) {
        console.error("Error updating profile:", error)
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Failed to update profile",
        }
    }
}

async function fetchProfile(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const response = await apiClient.get("/account/customer/profile/")

        return {
            success: true,
            data: response.data.data, // Access the nested data object
        }
    } catch (error: any) {
        console.error("Error fetching profile:", error)
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Failed to fetch profile",
        }
    }
}

// Initial form data
const initialFormData: ProfileFormData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: [{
        street_address: "",
        postal_code: "",
        city: "",
        state: "",
        country: "",
    }],
    profile_image: null,
    preferences: {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
        newsletter: true,
    },
    socialMedia: {
        twitter: "",
        linkedin: "",
        instagram: "",
    },
}

function ProfileForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useUser()

    // Check if we're in editing mode based on user existence
    const isEditing = Boolean(user?.first_name||user?.last_name )

    const [formData, setFormData] = useState<ProfileFormData>(initialFormData)
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [avatarPreview, setAvatarPreview] = useState<string>("")
    const [loading, setLoading] = useState(false)

    // Load profile data if editing
    useEffect(() => {
        if (isEditing) {
            loadProfile()
        }
    }, [isEditing])

    const loadProfile = async () => {
        setLoading(true)
        try {
            const response = await fetchProfile()
            if (response.success && response.data) {
                const profileData = response.data

                // Map API response to form data
                const mappedData: ProfileFormData = {
                    id: profileData.id,
                    first_name: profileData.first_name || "",
                    last_name: profileData.last_name || "",
                    email: profileData.email || "",
                    phone: profileData.phone || "",
                    address: profileData.address && profileData.address.length > 0
                        ? profileData.address
                        : [{
                            street_address: "",
                            postal_code: "",
                            city: "",
                            state: "",
                            country: "",
                        }],
                    profile_image: profileData.profile_image || null,
                    preferences: {
                        emailNotifications: true,
                        smsNotifications: false,
                        marketingEmails: false,
                        newsletter: true,
                    },
                    socialMedia: {
                        twitter: "",
                        linkedin: "",
                        instagram: "",
                    },
                }

                setFormData(mappedData)

                // Set avatar preview if exists
                if (profileData.profile_image && typeof profileData.profile_image === "string") {
                    setAvatarPreview(profileData.profile_image)
                }
            } else {
                notifications.show({
                    title: "Error",
                    message: response.error || "Failed to load profile",
                    color: "red",
                    icon: <IconX size={16} />,
                })
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
            notifications.show({
                title: "Error",
                message: errorMessage,
                color: "red",
                icon: <IconX size={16} />,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleAddressChange = (field: keyof Address, value: string, index: number = 0) => {
        setFormData((prev) => {
            const newAddress = [...prev.address]
            newAddress[index] = {
                ...newAddress[index],
                [field]: value,
            }
            return {
                ...prev,
                address: newAddress,
            }
        })

        // Clear address errors
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleNestedInputChange = (parent: string, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: {
                ...(prev[parent as keyof ProfileFormData] as any),
                [field]: value,
            },
        }))
    }

    const handleAvatarChange = (file: File | null) => {
        if (file) {
            setFormData((prev) => ({ ...prev, profile_image: file }))
            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setFormData((prev) => ({ ...prev, profile_image: null }))
            setAvatarPreview("")
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.first_name.trim()) {
            newErrors.first_name = "First name is required"
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = "Last name is required"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required"
        }

        // Validate address (first address in array)
        const address = formData.address[0]
        if (!address.street_address.trim()) {
            newErrors.street_address = "Street address is required"
        }
        if (!address.city.trim()) {
            newErrors.city = "City is required"
        }
        if (!address.country.trim()) {
            newErrors.country = "Country is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            notifications.show({
                title: "Validation Error",
                message: "Please fix the errors in the form",
                color: "red",
                icon: <IconX size={16} />,
            })
            return
        }

        setSubmitting(true)
        setErrors({})

        try {
            let response: { success: boolean; data?: any; error?: string }

            if (isEditing) {
                response = await updateProfile(formData)
            } else {
                response = await createProfile(formData)
            }

            if (response.success) {
                notifications.show({
                    title: "Success",
                    message: `Profile ${isEditing ? "updated" : "created"} successfully!`,
                    color: "teal",
                    icon: <IconCheck size={16} />,
                })

                // Redirect after success
                setTimeout(() => {
                    router.push("/Profile")
                }, 1500)
            } else {
                setErrors({ general: response.error || "An error occurred" })
                notifications.show({
                    title: "Error",
                    message: response.error || "Failed to save profile",
                    color: "red",
                    icon: <IconX size={16} />,
                })
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
            setErrors({ general: errorMessage })
            notifications.show({
                title: "Error",
                message: errorMessage,
                color: "red",
                icon: <IconX size={16} />,
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleReset = () => {
        if (confirm("Are you sure you want to reset the form? All changes will be lost.")) {
            if (isEditing) {
                loadProfile() // Reload original data
            } else {
                setFormData(initialFormData)
                setAvatarPreview("")
            }
            setErrors({})
        }
    }

    if (loading) {
        return (
            <Box style={{ minHeight: "100vh", background: "lightslategray" }}>
                <Container size="md" py="xl">
                    <Paper radius="xl" p="xl" style={{ background: "#F2F7F2", textAlign: "center" }}>
                        <MithoSweetsLoader/>
                    </Paper>
                </Container>
            </Box>
        )
    }

    return (
        <Box style={{ minHeight: "100vh", background: "lightslategray" }}>
            <Container size="md" py="xl">
                <Stack gap="xl">
                    {/* Header */}
                    <Paper radius="xl" p="xl" style={{ background: "#F2F7F2", color: "black" }}>
                        <Group justify="space-between" align="center">
                            <Group gap="md">
                                <ActionIcon variant="white" color="dark" size="lg" radius="md" onClick={() => router.back()}>
                                    <IconArrowLeft size={20} />
                                </ActionIcon>
                                <Stack gap="xs">
                                    <Title order={1} size="h2">
                                        {isEditing ? "Edit Profile" : "Create Profile"}
                                    </Title>
                                    <Group gap="xs">
                                        {isEditing ? <IconEdit size={16} /> : <IconUserPlus size={16} />}
                                        <Badge color="crimson" size="sm">
                                            {isEditing ? "Editing Mode" : "New Profile"}
                                        </Badge>
                                    </Group>
                                </Stack>
                            </Group>
                            <Button color="crimson" onClick={handleReset} radius="md" size="sm">
                                Reset Form
                            </Button>
                        </Group>
                    </Paper>

                    {/* Error Alert */}
                    {errors.general && (
                        <Alert
                            icon={<IconAlertCircle size={16} />}
                            title="Error"
                            color="red"
                            radius="md"
                            onClose={() => setErrors((prev) => ({ ...prev, general: "" }))}
                            withCloseButton
                        >
                            {errors.general}
                        </Alert>
                    )}

                    {/* Form */}
                    <Paper radius="xl" p="xl" style={{ backgroundColor: "#F2F7F2" }}>
                        <form onSubmit={handleSubmit}>
                            <Stack gap="xl">
                                {/* Avatar Section */}
                                <Card padding="xl" radius="lg" withBorder>
                                    <Stack align="center" gap="lg">
                                        <Title order={3} c="dark.8">
                                            Profile Picture
                                        </Title>
                                        <Avatar
                                            src={avatarPreview || "/placeholder.svg"}
                                            alt="Profile Avatar"
                                            size={120}
                                            radius="50%"
                                            style={{ border: "4px solid #e2e8f0" }}
                                        />
                                        <FileInput
                                            placeholder="Choose profile picture"
                                            accept="image/*"
                                            leftSection={<IconUpload size={16} />}
                                            onChange={handleAvatarChange}
                                            clearable
                                            radius="md"
                                            style={{ width: "100%", maxWidth: "300px" }}
                                        />
                                        <Text size="xs" c="dimmed" ta="center">
                                            Supported formats: JPG, PNG, GIF (Max 5MB)
                                        </Text>
                                    </Stack>
                                </Card>

                                {/* Personal Information */}
                                <Card padding="xl" radius="lg" withBorder>
                                    <Stack gap="lg">
                                        <Title order={3} c="dark.8">
                                            Personal Information
                                        </Title>
                                        <Grid gutter="lg">
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <TextInput
                                                    label="First Name"
                                                    placeholder="Enter your first name"
                                                    leftSection={<IconUser size={16} />}
                                                    value={formData.first_name}
                                                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                                                    error={errors.first_name}
                                                    required
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <TextInput
                                                    label="Last Name"
                                                    placeholder="Enter your last name"
                                                    leftSection={<IconUser size={16} />}
                                                    value={formData.last_name}
                                                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                                                    error={errors.last_name}
                                                    required
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <TextInput
                                                    label="Email Address"
                                                    placeholder="Enter your email"
                                                    leftSection={<IconMail size={16} />}
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    error={errors.email}
                                                    required
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <TextInput
                                                    label="Phone Number"
                                                    placeholder="Enter your phone number"
                                                    leftSection={<IconPhone size={16} />}
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                                    error={errors.phone}
                                                    required
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    </Stack>
                                </Card>

                                {/* Address Information */}
                                <Card padding="xl" radius="lg" withBorder>
                                    <Stack gap="lg">
                                        <Title order={3} c="dark.8">
                                            Address Information
                                        </Title>
                                        <Grid gutter="lg">
                                            <Grid.Col span={12}>
                                                <TextInput
                                                    label="Street Address"
                                                    placeholder="Enter your street address"
                                                    leftSection={<IconMapPin size={16} />}
                                                    value={formData.address[0]?.street_address || ""}
                                                    onChange={(e) => handleAddressChange("street_address", e.target.value)}
                                                    error={errors.street_address}
                                                    required
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <TextInput
                                                    label="City"
                                                    placeholder="Enter your city"
                                                    value={formData.address[0]?.city || ""}
                                                    onChange={(e) => handleAddressChange("city", e.target.value)}
                                                    error={errors.city}
                                                    required
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <TextInput
                                                    label="State/Province"
                                                    placeholder="Enter your state"
                                                    value={formData.address[0]?.state || ""}
                                                    onChange={(e) => handleAddressChange("state", e.target.value)}
                                                    error={errors.state}
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <TextInput
                                                    label="Postal Code"
                                                    placeholder="Enter your postal code"
                                                    value={formData.address[0]?.postal_code || ""}
                                                    onChange={(e) => handleAddressChange("postal_code", e.target.value)}
                                                    error={errors.postal_code}
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <TextInput
                                                    label="Country"
                                                    placeholder="Enter your country"
                                                    value={formData.address[0]?.country || ""}
                                                    onChange={(e) => handleAddressChange("country", e.target.value)}
                                                    error={errors.country}
                                                    required
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    </Stack>
                                </Card>

                                {/* Preferences */}
                                <Card padding="xl" radius="lg" withBorder>
                                    <Stack gap="lg">
                                        <Title order={3} c="dark.8">
                                            Notification Preferences
                                        </Title>
                                        <Grid gutter="lg">
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <Switch
                                                    label="Email Notifications"
                                                    description="Receive notifications via email"
                                                    checked={formData.preferences?.emailNotifications || false}
                                                    onChange={(e) =>
                                                        handleNestedInputChange("preferences", "emailNotifications", e.target.checked)
                                                    }
                                                    color="crimson"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <Switch
                                                    label="SMS Notifications"
                                                    description="Receive notifications via SMS"
                                                    checked={formData.preferences?.smsNotifications || false}
                                                    onChange={(e) => handleNestedInputChange("preferences", "smsNotifications", e.target.checked)}
                                                    color="crimson"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <Switch
                                                    label="Marketing Emails"
                                                    description="Receive promotional emails"
                                                    checked={formData.preferences?.marketingEmails || false}
                                                    onChange={(e) => handleNestedInputChange("preferences", "marketingEmails", e.target.checked)}
                                                    color="crimson"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 6 }}>
                                                <Switch
                                                    label="Newsletter"
                                                    description="Subscribe to our newsletter"
                                                    checked={formData.preferences?.newsletter || false}
                                                    onChange={(e) => handleNestedInputChange("preferences", "newsletter", e.target.checked)}
                                                    color="crimson"
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    </Stack>
                                </Card>

                                {/* Social Media */}
                                <Card padding="xl" radius="lg" withBorder>
                                    <Stack gap="lg">
                                        <Title order={3} c="dark.8">
                                            Social Media (Optional)
                                        </Title>
                                        <Grid gutter="lg">
                                            <Grid.Col span={{ base: 12, md: 4 }}>
                                                <TextInput
                                                    label="Twitter"
                                                    placeholder="@username"
                                                    value={formData.socialMedia?.twitter || ""}
                                                    onChange={(e) => handleNestedInputChange("socialMedia", "twitter", e.target.value)}
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 4 }}>
                                                <TextInput
                                                    label="LinkedIn"
                                                    placeholder="linkedin.com/in/username"
                                                    value={formData.socialMedia?.linkedin || ""}
                                                    onChange={(e) => handleNestedInputChange("socialMedia", "linkedin", e.target.value)}
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, md: 4 }}>
                                                <TextInput
                                                    label="Instagram"
                                                    placeholder="@username"
                                                    value={formData.socialMedia?.instagram || ""}
                                                    onChange={(e) => handleNestedInputChange("socialMedia", "instagram", e.target.value)}
                                                    radius="md"
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    </Stack>
                                </Card>

                                <Divider />

                                {/* Action Buttons */}
                                <Group justify="space-between">
                                    <Button variant="outline" color="gray" onClick={() => router.back()} radius="md" size="md">
                                        Cancel
                                    </Button>
                                    <Group gap="sm">
                                        <Button variant="outline" color="crimson" onClick={handleReset} radius="md" size="md">
                                            Reset
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="crimson"
                                            leftSection={<IconDeviceFloppy size={16} />}
                                            loading={submitting}
                                            radius="md"
                                            size="md"
                                        >
                                            {isEditing ? "Update Profile" : "Create Profile"}
                                        </Button>
                                    </Group>
                                </Group>
                            </Stack>
                        </form>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    )
}

export default ProfileForm
