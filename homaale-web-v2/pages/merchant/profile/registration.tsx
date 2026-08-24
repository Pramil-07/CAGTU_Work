// import React, { useState } from 'react';
// import {
//     TextInput,
//     Select,
//     Grid,
//     Title,
//     Container,
//     Stack,
//     Group,
//     Button,
//     FileInput,
//     Paper,
//     Checkbox,
//     Flex,
//     Textarea,
// } from '@mantine/core';
// import { DateInput } from '@mantine/dates';
// import { IconUpload } from '@tabler/icons-react';
// import { useForm } from '@mantine/form';
// import Layout from "@/components/Layout/Layout";
//
// interface MerchantRegistrationForm {
//     businessName: string;
//     legalStructure: string;
//     dateEstablished: Date | null;
//     industryType: string;
//     taxId: string;
//     ownerName: string;
//     ownerEmail: string;
//     ownerPhone: string;
//     socialMediaLinks: {
//         facebook: string;
//         instagram: string;
//         linkedin: string;
//     };
//     bankName: string;
//     accountNumber: string;
//     routingNumber: string;
//     paypalEmail: string;
//     streetAddress: string;
//     city: string;
//     state: string;
//     postalCode: string;
//     country: string;
//     businessDescription: string;
//     productsOffered: string[];
//     businessRegistration: File | null;
//     taxDocuments: File | null;
//     governmentId: File | null;
// }
//
// const MerchantRegistration = () => {
//     const [agreeTerms, setAgreeTerms] = useState(false);
//
//     const form = useForm<MerchantRegistrationForm>({
//         initialValues: {
//             businessName: '',
//             legalStructure: '',
//             dateEstablished: null,
//             industryType: '',
//             taxId: '',
//             ownerName: '',
//             ownerEmail: '',
//             ownerPhone: '',
//             socialMediaLinks: {
//                 facebook: '',
//                 instagram: '',
//                 linkedin: '',
//             },
//             bankName: '',
//             accountNumber: '',
//             routingNumber: '',
//             paypalEmail: '',
//             streetAddress: '',
//             city: '',
//             state: '',
//             postalCode: '',
//             country: '',
//             businessDescription: '',
//             productsOffered: [],
//             businessRegistration: null,
//             taxDocuments: null,
//             governmentId: null,
//         },
//
//         // validate: {
//         //     businessName: (value) => (!value ? 'Business name is ' : null),
//         //     legalStructure: (value) => (!value ? 'Legal structure is ' : null),
//         //     dateEstablished: (value) => (!value ? 'Date is ' : null),
//         //     industryType: (value) => (!value ? 'Industry type is ' : null),
//         //     taxId: (value) => (!value ? 'Tax ID is ' : null),
//         //     ownerName: (value) => (!value ? 'Owner name is ' : null),
//         //     ownerEmail: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
//         //     ownerPhone: (value) => (!value ? 'Phone number is ' : null),
//         //     bankName: (value) => (!value ? 'Bank name is ' : null),
//         //     accountNumber: (value) => (!value ? 'Account number is ' : null),
//         //     routingNumber: (value) => (!value ? 'Routing number is ' : null),
//         //     streetAddress: (value) => (!value ? 'Street address is ' : null),
//         //     city: (value) => (!value ? 'City is ' : null),
//         //     state: (value) => (!value ? 'State is ' : null),
//         //     postalCode: (value) => (!value ? 'Postal code is ' : null),
//         //     country: (value) => (!value ? 'Country is ' : null),
//         //     businessDescription: (value) => (!value ? 'Business description is ' : null),
//         // },
//     });
//
//     const handleSubmit = (values: MerchantRegistrationForm) => {
//         console.log("✅ Form submission started");
//         console.log("Form values:", values);
//
//         if (Object.keys(form.errors).length > 0) {
//             console.error("Form has validation errors:", form.errors);
//             return;
//         }
//
//         if (!agreeTerms) {
//             alert("Please agree to the Terms & Conditions");
//             return;
//         }
//
//         console.log("✅ Form validation passed, proceeding with submission");
//         alert("Form Submitted! Check the console for details.");
//     };
//
//     return (
//         <Layout currentTitle="merchant registration">
//             <Container size="lg" py="xl">
//                 <Flex>
//                     <Title order={3} size={20} mb={20} weight={600}>
//                         Add Your Merchant Details
//                     </Title>
//                 </Flex>
//
//                 <form onSubmit={form.onSubmit(handleSubmit)}>
//                     <Grid gutter="xl">
//                         {/* Left Column */}
//                         <Grid.Col md={6}>
//                             <Paper shadow="sm" p="md" withBorder>
//                                 <Title order={2} size="h4" mb="xl">Business Information</Title>
//                                 <Stack>
//                                     <TextInput
//
//                                         label="Business Name"
//                                         {...form.getInputProps('businessName')}
//                                     />
//                                     <Select
//
//                                         label="Legal Structure"
//                                         data={['Sole Proprietorship', 'LLC', 'Corporation', 'Partnership']}
//                                         {...form.getInputProps('legalStructure')}
//                                     />
//                                     <DateInput
//
//                                         label="Date Established"
//                                         {...form.getInputProps('dateEstablished')}
//                                     />
//                                     <Select
//
//                                         label="Industry Type"
//                                         data={[
//                                             'Retail',
//                                             'Technology',
//                                             'Healthcare',
//                                             'Manufacturing',
//                                             'Services',
//                                             'Other'
//                                         ]}
//                                         {...form.getInputProps('industryType')}
//                                     />
//                                     <TextInput
//
//                                         label="Tax ID / VAT Number"
//                                         {...form.getInputProps('taxId')}
//                                     />
//                                 </Stack>
//                             </Paper>
//
//                             <Paper shadow="sm" p="md" withBorder mt="xl">
//                                 <Title order={2} size="h4" mb="md">Financial Information</Title>
//                                 <Stack>
//                                     <TextInput
//
//                                         label="Bank Name"
//                                         {...form.getInputProps('bankName')}
//                                     />
//                                     <TextInput
//
//                                         label="Account Number"
//                                         {...form.getInputProps('accountNumber')}
//                                     />
//                                     <TextInput
//
//                                         label="Routing Number"
//                                         {...form.getInputProps('routingNumber')}
//                                     />
//                                     <TextInput
//                                         label="PayPal Email (Optional)"
//                                         type="email"
//                                         {...form.getInputProps('paypalEmail')}
//                                     />
//                                 </Stack>
//                             </Paper>
//
//                             <Paper shadow="sm" p="md" withBorder mt="xl">
//                                 <Title order={2} size="h4" mb="md">Business Address</Title>
//                                 <Stack>
//                                     <TextInput
//
//                                         label="Street Address"
//                                         {...form.getInputProps('streetAddress')}
//                                     />
//                                     <TextInput
//
//                                         label="City"
//                                         {...form.getInputProps('city')}
//                                     />
//                                     <TextInput
//
//                                         label="State/Province"
//                                         {...form.getInputProps('state')}
//                                     />
//                                     <TextInput
//
//                                         label="Postal Code"
//                                         {...form.getInputProps('postalCode')}
//                                     />
//                                     <TextInput
//
//                                         label="Country"
//                                         {...form.getInputProps('country')}
//                                     />
//                                 </Stack>
//                             </Paper>
//                         </Grid.Col>
//
//                         {/* Right Column */}
//                         <Grid.Col md={6}>
//                             <Paper shadow="sm" p="md" withBorder>
//                                 <Title order={2} size="h4" mb="md">Owner Information</Title>
//                                 <Stack>
//                                     <TextInput
//
//                                         label="Full Name"
//                                         {...form.getInputProps('ownerName')}
//                                     />
//                                     <TextInput
//
//                                         label="Email"
//                                         type="email"
//                                         {...form.getInputProps('ownerEmail')}
//                                     />
//                                     <TextInput
//
//                                         label="Phone Number"
//                                         {...form.getInputProps('ownerPhone')}
//                                     />
//                                 </Stack>
//                             </Paper>
//
//                             <Paper shadow="sm" p="md" withBorder mt="xl">
//                                 <Title order={2} size="h4" mb="md">Social Media Links</Title>
//                                 <Stack>
//                                     <TextInput
//                                         label="Facebook Profile"
//                                         placeholder="https://facebook.com/..."
//                                         {...form.getInputProps('socialMediaLinks.facebook')}
//                                     />
//                                     <TextInput
//                                         label="Instagram Profile"
//                                         placeholder="https://instagram.com/..."
//                                         {...form.getInputProps('socialMediaLinks.instagram')}
//                                     />
//                                     <TextInput
//                                         label="LinkedIn Profile"
//                                         placeholder="https://linkedin.com/in/..."
//                                         {...form.getInputProps('socialMediaLinks.linkedin')}
//                                     />
//                                 </Stack>
//                             </Paper>
//
//                             <Paper shadow="sm" p="md" withBorder mt="xl">
//                                 <Title order={2} size="h4" mb="md">Business Description</Title>
//                                 <Stack>
//                                     <Textarea
//
//                                         label="Business Description"
//                                         placeholder="Describe your business..."
//                                         minRows={3}
//                                         {...form.getInputProps('businessDescription')}
//                                     />
//                                 </Stack>
//                             </Paper>
//
//                             <Paper shadow="sm" p="md" withBorder mt="xl">
//                                 <Title order={2} size="h4" mb="md"> Documents</Title>
//                                 <Stack>
//                                     <FileInput
//
//                                         label="Business Registration Certificate"
//                                         icon={<IconUpload size={14}/>}
//                                         onChange={(file) => form.setFieldValue("businessRegistration", file)}
//                                     />
//                                     <FileInput
//
//                                         label="Tax Documents"
//                                         icon={<IconUpload size={14}/>}
//                                         onChange={(file) => form.setFieldValue("taxDocuments", file)}
//                                     />
//                                     <FileInput
//
//                                         label="Government Issued ID"
//                                         icon={<IconUpload size={14}/>}
//                                         onChange={(file) => form.setFieldValue("governmentId", file)}
//                                     />
//                                 </Stack>
//                             </Paper>
//
//                             <Paper shadow="sm" p="md" withBorder mt="xl">
//                                 <Stack>
//                                     <Checkbox
//                                         label="I agree to the Terms & Conditions"
//                                         checked={agreeTerms}
//                                         onChange={(e) => setAgreeTerms(e.currentTarget.checked)}
//                                     />
//                                 </Stack>
//                                 <Group position="center" mt="md">
//                                     <Button
//                                         type="submit"
//                                         size="sm"
//                                         disabled={!agreeTerms}
//                                     >
//                                         Submit Registration
//                                     </Button>
//                                 </Group>
//                             </Paper>
//                         </Grid.Col>
//                     </Grid>
//                 </form>
//             </Container>
//         </Layout>
//     );
// };
//
// export default MerchantRegistration;


import React, {useEffect, useState} from 'react';
import {
    TextInput,
    Select,
    Grid,
    Title,
    Container,
    Stack,
    Group,
    Button,
    FileInput,
    Paper,
    Checkbox,
    Text,
    NumberInput,
    Input,
    Stepper,
    Center,
} from '@mantine/core';
import {IconUpload} from '@tabler/icons-react';
import {useForm} from '@mantine/form';
import Layout from "@/components/Layout/Layout";
import {DateInput, TimeInput} from "@mantine/dates";
import {axiosClient} from "@/utils/axiosClient";
import urls from "@/constants/urls";
import {useProfile} from "@/hooks/useProfile";
import {toast} from "@/components/common/Toast";
import {Country} from "@/hooks/useCountryOptions";
import type {CurrencyOptionsProps} from "@/types/CurrencyOptionsProps";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {useRouter} from "next/router";
import {PlacesAutocomplete} from "@/components/common/form/PlacesAutoComplete";
import Map from "@/components/common/Map";
import {Circle, MarkerF} from "@react-google-maps/api";
import type {LocationProps} from "@/types/LocationProps";
import {useAppSelector} from "@/hooks";
import {useGeocoding} from "@/hooks/useGeocoding";
import SelectField from "@/components/common/form/SelectField";
import {SelectOption} from "@/pages/post/entity";
import {NestedCategoryProps} from "@/types/NestedCategoryProps";
import NestedCategorySelect from "@/components/NestedCategorySelect/NestedCategorySelect";

dayjs.extend(customParseFormat);

// API Response Interface
interface MerchantApiResponse {
    id: string;
    user: string;
    owner: string;
    active_hour_start: string;
    active_hour_end: string;
    category: number;
    full_name: string;
    description: string;
    logo: string;
    default_currency: string;
    city: number;
    country: string;
    address_line1: string;
    address_line2: string;
    extra_data: Record<string, any>;
    commission: number;
}

// Form Interface
interface MerchantRegistrationForm {
    owner: string;
    user: string;
    full_name: string;
    active_hour_start: string;
    active_hour_end: string;
    category: number;
    description: string;
    logo: File | null;
    default_currency: string;
    city: number;
    country: string;
    address_line1: string;
    address_line2: string;
    commission: number;
    businessName?: string;
    legalStructure?: string;
    dateEstablished?: Date | null;
    industryType?: string;
    taxId?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
    socialMediaLinks?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
    };
    bankName?: string;
    accountNumber?: string;
    paypalEmail?: string;
    businessDescription?: string;
    businessRegistration?: File | null;
    taxDocuments?: File | null;
    governmentId?: File | null;
    selectedAddress: string | null;
    latitude: number | null;
    longitude: number | null;
}

const MerchantRegistration = () => {
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [activeStep, setActiveStep] = useState(0); // Track the current step
    const [merhcant, setMerhcant] = useState<{ id: number, name: string }[]>([]);
    const [cities, setCities] = useState<{ id: number, name: string }[]>([]);
    /*const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);*/
    const [categoryNested, setCategoryNested] = useState<NestedCategoryProps[]>([]);
    const [countries, setCountries] = useState<Country>([]);
    const [currency, setCurrency] = useState<CurrencyOptionsProps>([]);
    const {data: profileData} = useProfile();
    const profileId = profileData?.user?.id ?? "";
    const router = useRouter();
    const [openMap, setOpenMap] = useState(false);


    const {data: locations, radius} = useAppSelector(
        (state) => state.locationReducer
    );
    const [maplocation, setMapLocation] = useState<{
        selected?: string,
        lat: LocationProps["data"]["latitude"];
        lng: LocationProps["data"]["longitude"];
    }>({
        selected: '',
        lat: null,
        lng: null,
    });

    const form = useForm<MerchantRegistrationForm>({
        initialValues: {
            owner: profileId,
            user: profileId,
            full_name: '',
            active_hour_start: '',
            active_hour_end: '',
            category: 0,
            description: '',
            logo: null,
            default_currency: '',
            city: 0,
            country: '',
            address_line1: '',
            address_line2: '',
            commission: 0.5,
            businessName: '',
            legalStructure: '',
            dateEstablished: null,
            industryType: '',
            taxId: '',
            ownerName: '',
            ownerEmail: '',
            ownerPhone: '',
            socialMediaLinks: {facebook: '', instagram: '', linkedin: ''},
            bankName: '',
            accountNumber: '',
            paypalEmail: '',
            businessDescription: '',
            businessRegistration: null,
            taxDocuments: null,
            governmentId: null,
            selectedAddress: maplocation.selected ?? '',
            latitude: maplocation.lat ?? null,
            longitude: maplocation.lng ?? null,
        },
        validate: {
            full_name: (value) => (!value.trim() ? 'Merchant name is required' : null),
            category: (value) => (value === 0 ? 'Category is required' : null),
            default_currency: (value) => (!value ? 'Default currency is required' : null),
            country: (value) => (!value ? 'Country is required' : null),
            address_line1: (value) => (!value.trim() ? 'Address is required' : null),
            city: (value) => (value === 0 ? 'City is required' : null),
            // logo: (value) => (!value ? 'Image is required' : null),
            // latitude: (value) => (value === null ? 'Please select a location on the map' : null),
            // longitude: (value) => (value === null ? 'Please select a location on the map' : null),
            active_hour_start: (value) => {
                if (!value) return 'Start time is required';
                if (!dayjs(value, 'HH:mm', true).isValid()) return 'Invalid time format';
                return null;
            },
            active_hour_end: (value) => {
                if (!value) return 'End time is required';
                if (!dayjs(value, 'HH:mm', true).isValid()) return 'Invalid time format';
                return null;
            },
        },
    });

    const flattenCategoriesForSelect = (
        categories: NestedCategoryProps[],
        level = 0,
        ancestors: string[] = []
    ): { value: string; label: string; fontWeight?: 'bold' | 'normal' }[] => {
        let options: { value: string; label: string; fontWeight?: 'bold' | 'normal' }[] = [];

        categories.forEach((category) => {
            options.push({
                value: category.id.toString(),
                label: `${'→ '.repeat(level)}${category.name}`,
                fontWeight: level === 0 ? 'bold' : 'normal',
            });

            if (category.child && category.child.length > 0) {
                options = options.concat(
                    flattenCategoriesForSelect(category.child, level + 1, [...ancestors, category.id.toString()])
                );
            }
        });

        return options;
    };
    const categoryOptions = flattenCategoriesForSelect(categoryNested);
    // Data fetching useEffects remain unchanged
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await axiosClient.get("/locale/client/city/options");
                setCities(response.data);
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosClient.get(urls.category.nested);
                setCategoryNested(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchCountry = async () => {
            try {
                const response = await axiosClient.get<Country>("/locale/client/country/options/");
                setCountries(response.data);
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };
        fetchCountry();
    }, []);

    useEffect(() => {
        const fetchMerchant = async () => {
            try {
                const response = await axiosClient.get("merchant/");
                setMerhcant(response.data);
            } catch (error) {
                console.log("error", error);
            }
        };
        fetchMerchant();
    }, []);

    useEffect(() => {
        const fetchCurrency = async () => {
            try {
                const {data} = await axiosClient.get<CurrencyOptionsProps>(urls.locale.currency);
                setCurrency(data);
            } catch (error) {
                console.log("Error fetching currency:", error);
            }
        };
        fetchCurrency();
    }, []);

    useEffect(() => {
        if (profileId) {
            form.setValues({owner: profileId, user: profileId});
        }
    }, [profileId]);

    const transformFormDataToApiFormat = (values: MerchantRegistrationForm): Partial<MerchantApiResponse> => {
        const {
            owner,
            user,
            full_name,
            active_hour_start,
            active_hour_end,
            category,
            description,
            logo,
            default_currency,
            city,
            country,
            address_line1,
            address_line2,
            commission,
            ...extraData
        } = values;
        return {
            owner,
            user,
            full_name,
            active_hour_start,
            active_hour_end,
            category,
            description,
            logo: logo ? 'pending_upload' : '',
            default_currency,
            city,
            country,
            address_line1,
            address_line2,
            commission,
            extra_data: extraData
        };
    };
    const {data} = useGeocoding(
        `${maplocation.lat},${maplocation.lng}`
    );
    useEffect(() => {
        if (maplocation.selected) {
            form.setFieldValue("address_line1", maplocation.selected);
        }
    }, [maplocation.selected]);

    useEffect(() => {
        if (maplocation.lat && maplocation.lng && typeof data === "string") {
            setMapLocation((prev) => ({...prev, selected: data}));
            form.setFieldValue("address_line1", data);
        }
    }, [maplocation.lat, maplocation.lng, data]);


    console.log('data map', data)

    const handleSubmit = async (values: MerchantRegistrationForm) => {
        if (!agreeTerms) {
            toast.error("Please agree to the Terms & Conditions");
            return;
        }
        try {
            const formData = new FormData();
            if (values.logo) formData.append("logo", values.logo);
            if (values.businessRegistration) formData.append("businessRegistration", values.businessRegistration);
            if (values.taxDocuments) formData.append("taxDocuments", values.taxDocuments);
            if (values.governmentId) formData.append("governmentId", values.governmentId);

            if (!form.values.address_line1) {
                throw new Error("Address is required");
            }
            formData.append("address_line1", form.values.address_line1);

            if (maplocation.lat) formData.append('latitude', maplocation.lat.toString());
            if (maplocation.lng) formData.append('longitude', maplocation.lng.toString());


            const apiFormattedData = transformFormDataToApiFormat(values);
            Object.entries(apiFormattedData).forEach(([key, value]) => {
                let formattedValue: string | Blob = "";
                if (value !== null && value !== undefined) {
                    const valueAsString = typeof value === "object" ? "" : String(value);
                    if (key === "active_hour_start" || key === "active_hour_end") {
                        const parsedTime = dayjs(valueAsString, ["HH:mm", "HH:mm:ss"], true);
                        formattedValue = parsedTime.isValid() ? parsedTime.format("HH:mm:ss") : "";
                    } else if (typeof value === "number") {
                        formattedValue = String(value);
                    } else if (typeof value === "object") {
                        formattedValue = JSON.stringify(value);
                    } else if (typeof value === "string") {
                        formattedValue = value;
                    }
                    formData.append(key, formattedValue);
                }
            });

            const response = await axiosClient.post(urls.members.loggedUserID, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
             console.log("✅ Merchant created:", response.data);
            toast.success("Merchant registration successful!");
            router.push("/merchant/profile");
        } catch (error: any) {
            if (error.response) {
                console.error("❌ Error creating merchant:", error.response.data);
                toast.error(`Error: ${error.response.data.message || "Something went wrong!"}`);
            } else {
                console.error("❌ Request failed:", error.message);
                toast.error("Network error. Please check your connection.");
            }
        }
    };

    const isStepValid = () => {
        const values = form.values;
        if (activeStep === 0) {
            return (
                values.full_name.trim() !== '' &&
                values.category !== 0 &&
                values.default_currency !== '' &&
                values.country !== '' &&
                values.address_line1.trim() !== '' &&
                values.city !== 0 &&
                // values.logo !== null &&
                // values.latitude !== null &&
                // values.longitude !== null &&
                values.active_hour_start !== '' &&
                dayjs(values.active_hour_start, 'HH:mm', true).isValid() &&
                values.active_hour_end !== '' &&
                dayjs(values.active_hour_end, 'HH:mm', true).isValid()
            );
        }
        return true;
    };

    const nextStep = () => {
        form.validate();
        if (isStepValid()) {
            setActiveStep((current) => (current < 2 ? current + 1 : current));
        } else {
            toast.error("Please fill in all required fields before proceeding.");
        }
    };

    const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

    return (
        <Layout currentTitle="Merchant Registration">
            <Container size="md" py="xl">
                <Title order={2} align="center" mb="lg">Create Your Merchant Account</Title>

                {/* Stepper for Progress Indicator */}
                <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="sm" mb="xl">
                    <Stepper.Step label="Basic Information" description="Core merchant details"/>
                    <Stepper.Step label="Additional Details" description="Business and financial info"/>
                    <Stepper.Step label="Documents & Submit" description="Upload documents and submit"/>
                </Stepper>

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    {/* Step 1: Basic Information */}
                    {activeStep === 0 && (
                        <Paper shadow="sm" p="lg" withBorder>
                            <Title order={3} size="h4" mb="lg">Basic Information</Title>
                            <Stack>
                                <TextInput label="Merchant's Name" {...form.getInputProps('full_name')} required
                                           error={form.errors.full_name}/>
                                <Group grow >
                                    <div>
                                        <Text size="sm">Active Hour Start<span style={{color: 'red'}}>*</span></Text>
                                        <Input type="time" {...form.getInputProps('active_hour_start')} required
                                               error={form.errors.active_hour_start}/>
                                    </div>
                                    <div>
                                        <Text size="sm">Active Hour End <span style={{color: 'red'}}>*</span></Text>
                                        <Input type="time" {...form.getInputProps('active_hour_end')} required
                                               error={form.errors.active_hour_end}/>
                                    </div>
                                </Group>
                                <NestedCategorySelect
                                    categories={categoryNested}
                                    value={form.values.category ? form.values.category.toString() : ""}
                                    onChange={(id: any) => form.setFieldValue('category', parseInt(id))}
                                    error={form.errors.category}
                                    touched={form.isTouched('category')}
                                    withAsterisk
                                    label="Category"
                                    placeholder="Select a category"
                                />
                                {/*<Select
                                    id="category"
                                    name="category"
                                    label="Category"
                                    data={categories.map(data => ({value: String(data.id), label: data.name}))}
                                    {...form.getInputProps('category')}
                                    required
                                    error={form.errors.category}
                                />*/}
                                <FileInput
                                    label="Business Logo"
                                    icon={<IconUpload size={14}/>}
                                    placeholder="Upload Business Logo"
                                    accept="image/png,image/jpeg"
                                    {...form.getInputProps('logo')}
                                    error={form.errors.logo}
                                    // withAsterisk
                                />
                                <Select
                                    label="Default Currency"
                                    data={currency.map(data => ({value: data.code, label: data.name}))}
                                    {...form.getInputProps('default_currency')}
                                    required
                                    error={form.errors.default_currency}
                                />
                                <Select
                                    label="City"
                                    data={cities.map(data => ({value: String(data.id), label: data.name}))}
                                    {...form.getInputProps('city')}
                                    required
                                    error={form.errors.city}
                                />
                                <Select
                                    label="Country"
                                    data={countries.map(data => ({value: data.code, label: data.name}))}
                                    {...form.getInputProps('country')}
                                    required
                                    error={form.errors.country}
                                />

                                <PlacesAutocomplete setCurrentLocation={setMapLocation} setOpenMap={setOpenMap}
                                                    openMap={openMap}
                                                    error={form.errors.address_line1}
                                />

                                {openMap && (
                                    <Map is_fullScreen location={{
                                        id: "1",
                                        lat: maplocation.lat,
                                        lng: maplocation.lng,
                                    }}
                                         onClick={(e) => {

                                             setMapLocation({
                                                 lat: e.latLng?.lat() ?? null,
                                                 lng: e.latLng?.lng() ?? null,
                                             });
                                             form.setFieldValue("latitude", e.latLng?.lat() ?? null);
                                             form.setFieldValue("longitude", e.latLng?.lng() ?? null);
                                         }}
                                    >
                                        {maplocation?.lat !== null && maplocation?.lng !== null && (
                                            <MarkerF
                                                icon={"/svgs/pin.svg"}
                                                draggable
                                                onDragEnd={(e) => {
                                                    const newLat = e.latLng?.lat() ?? null;
                                                    const newLng = e.latLng?.lng() ?? null;
                                                    setMapLocation({
                                                        lat: e.latLng?.lat() ?? 1,
                                                        lng: e.latLng?.lng() ?? 1,
                                                    });
                                                    form.setFieldValue("latitude", newLat);
                                                    form.setFieldValue("longitude", newLng);
                                                }}
                                                position={{
                                                    lat: maplocation?.lat ?? 27.7103,
                                                    lng: maplocation?.lng ?? 85.3222,
                                                }}
                                            />
                                        )}
                                    </Map>)}
                                {(form.errors.latitude || form.errors.longitude) && (
                                    <Text color="red" size="sm">
                                        {form.errors.latitude || form.errors.longitude}
                                    </Text>
                                )}
                                <TextInput label="Address Line 2" {...form.getInputProps('address_line2')}
                                           error={form.errors.address_line2}/>

                                <NumberInput
                                    label="Commission Rate"
                                    min={0}
                                    max={100}
                                    precision={2}
                                    {...form.getInputProps('commission')}
                                    required
                                    error={form.errors.commission}
                                />
                            </Stack>
                        </Paper>
                    )}

                    {/* Step 2: Additional Details */}
                    {activeStep === 1 && (
                        <Paper shadow="sm" p="lg" withBorder>
                            <Title order={3} size="h4" mb="lg">Additional Details</Title>
                            <Stack>
                                <TextInput label="Business Name" {...form.getInputProps('businessName')}
                                           error={form.errors.businessName}/>
                                <TextInput label="Owner Phone" {...form.getInputProps('ownerPhone')}
                                           error={form.errors.ownerPhone}/>
                                <Select
                                    label="Legal Structure"
                                    data={['Sole Proprietorship', 'LLC', 'Corporation', 'Partnership']}
                                    {...form.getInputProps('legalStructure')}
                                    error={form.errors.legalStructure}
                                />
                                <TextInput label="Tax ID / PAN Number" {...form.getInputProps('taxId')}
                                           error={form.errors.taxId}/>
                                <TextInput label="Bank Name" {...form.getInputProps('bankName')}
                                           error={form.errors.bankName}/>
                                <TextInput label="Account Number" {...form.getInputProps('accountNumber')}
                                           error={form.errors.accountNumber}/>
                                <TextInput
                                    label="PayPal Email (Optional)"
                                    type="email"
                                    {...form.getInputProps('paypalEmail')}
                                    error={form.errors.paypalEmail}
                                />
                            </Stack>
                        </Paper>
                    )}

                    {/* Step 3: Documents & Submission */}
                    {activeStep === 2 && (
                        <Paper shadow="sm" p="lg" withBorder>
                            <Title order={3} size="h4" mb="lg">Documents & Submission</Title>
                            <Stack>
                                <TextInput
                                    label="Facebook Profile"
                                    placeholder="https://facebook.com/..."
                                    {...form.getInputProps('socialMediaLinks.facebook')}
                                    error={form.errors['socialMediaLinks.facebook']}
                                />
                                <TextInput
                                    label="Instagram Profile"
                                    placeholder="https://instagram.com/..."
                                    {...form.getInputProps('socialMediaLinks.instagram')}
                                    error={form.errors['socialMediaLinks.instagram']}
                                />
                                <TextInput
                                    label="LinkedIn Profile"
                                    placeholder="https://linkedin.com/in/..."
                                    {...form.getInputProps('socialMediaLinks.linkedin')}
                                    error={form.errors['socialMediaLinks.linkedin']}
                                />
                                <FileInput
                                    label="Business Registration Certificate"
                                    icon={<IconUpload size={14}/>}
                                    placeholder="Upload Your Documents"
                                    {...form.getInputProps('businessRegistration')}
                                    error={form.errors.businessRegistration}
                                />
                                <FileInput
                                    label="Tax Documents"
                                    placeholder="Upload Your Documents"
                                    icon={<IconUpload size={14}/>}
                                    {...form.getInputProps('taxDocuments')}
                                    error={form.errors.taxDocuments}
                                />
                                <FileInput
                                    label="Government Issued ID"
                                    placeholder="Upload Your Documents"
                                    icon={<IconUpload size={14}/>}
                                    {...form.getInputProps('governmentId')}
                                    error={form.errors.governmentId}
                                />
                                <Checkbox
                                    label="I agree to the Terms & Conditions"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.currentTarget.checked)}
                                />
                            </Stack>
                        </Paper>
                    )}

                    {/* Navigation Buttons */}
                    <Group position="center" mt="xl">
                        {activeStep > 0 && (
                            <Button variant="default" onClick={prevStep}>Back</Button>
                        )}
                        {activeStep < 2 && (
                            <Button onClick={nextStep}>Next</Button>
                        )}
                        {activeStep === 2 && (
                            <Button type="submit" disabled={!agreeTerms}>Submit</Button>
                        )}
                    </Group>
                </form>
            </Container>
        </Layout>
    );
};

export default MerchantRegistration;


