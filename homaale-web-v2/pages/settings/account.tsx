import {
    Box,
    Button,
    Flex,
    Grid,
    Group,
    LoadingOverlay,
    MultiSelect,
    Radio,
    Text, Textarea,
    TextInput,
} from "@mantine/core";
import {
    IconCalendarEvent,
    IconCamera,
    IconInfoCircle,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Form, Formik } from "formik";
import { debounce } from "lodash";
import Image from "next/image";
import { useRef, useState } from "react";

import Asterik from "@/components/common/Asterik";
import DateField from "@/components/common/form/DateField";
import DescriptionField from "@/components/common/form/DescriptionField";
import InputField from "@/components/common/form/InputField";
import SelectField from "@/components/common/form/SelectField";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import { toast } from "@/components/common/Toast";
import { ImageUpload } from "@/components/ImageUpload/ImageUpload";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import { success } from "@/features/utils/modalSlice";
import { useAppDispatch } from "@/hooks";
import { useCategoryOptions } from "@/hooks/useCategoryOptions";
import { useCityOption } from "@/hooks/useCityOptions";
import { useCountryOptions } from "@/hooks/useCountryOptions";
import { useCurrencyOption } from "@/hooks/useCurrencyOptions";
import { useLanguageOptions } from "@/hooks/useLanguageOptions";
import { useProfile } from "@/hooks/useProfile";
import { useSkillsOptions } from "@/hooks/useSkillsOptions";
import { useUserStatus } from "@/hooks/useUserStatus";
import { profileVisibility } from "@/staticData/profileVisibility";
import { taskPreferences } from "@/staticData/taskPreferences";
import { useAccountSettingStyles } from "@/styles/pages/AccountSettingStyles";
import type { ProfileResponseProps } from "@/types/ProfileResponseProps";
import { axiosClient } from "@/utils/axiosClient";
import { isValidURL, scrollToElement } from "@/utils/helpers";
import { accountFormSchema } from "@/utils/validation/AccountFormValidation";

const Account = () => {
    // Getting required data from store and hooks
    const { data: profile, refetch, isLoading } = useProfile();

    const { data: currencyOptions = [] } = useCurrencyOption();
    const { data: languageOptions = [] } = useLanguageOptions();
    const { data: categoryOptions = [] } = useCategoryOptions();
    const { data: skillsOptions = [] } = useSkillsOptions();

    const hasProfile = profile ? true : false;

    //UI customizations
    const { classes } = useAccountSettingStyles();

    const handleCountryChanged = (
        code: string | null,
        setFieldValue: (field: string, value: any) => void
    ) => {
        // setCountryChange(code);
        if (code) setFieldValue("country", code);
    };
    const handleCityChanged = (
        id: string | null,
        setFieldValue: (field: string, value: any) => void
    ) => {
        if (id) setFieldValue("city", id);
    };

    const [searchCity, setSearchCity] = useState("");
    const {
        data: cityOptions = [
            {
                id: profile?.city?.id.toString() ?? "",
                label: profile?.city?.name ?? "",
                value: profile?.city?.id.toString() ?? "",
            },
        ],
    } = useCityOption(searchCity);

    const { data: countryOptions = [] } = useCountryOptions("");

    const [isProfileEdit, setIsProfileEdit] = useState<boolean>(false);

    const isInputDisabled = !isProfileEdit && profile ? true : false;

    const { mutate: editProfile, isLoading: isEditProfileLoading } =
        useMutation((data: FormData) =>
            axiosClient.patch<ProfileResponseProps>(urls.tasker.profile, data)
        );
    const { mutate: createProfile, isLoading: isCreateProfileLoading } =
        useMutation((data: FormData) =>
            axiosClient.post<ProfileResponseProps>(
                urls.tasker.create_profile,
                data
            )
        );

    const [display, setDisplay] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState();
    const [showEditForm, setShowEditForm] = useState(false);
    const [previewImage, setPreviewImage] = useState<
        RequestInfo | string | URL | undefined
    >();

    // const [blobUrl, setBlobUrl] = useState<RequestInfo | URL | undefined>();

    const queryClient = useQueryClient();
    // const [isNoProfileImage, setIsNoProfileImage] = useState(false);

    // useEffect(() => {
    //     if (!profile?.profile_image) {
    //         setIsNoProfileImage(true);
    //     }
    // }, []);

    const onButtonClick = () => {
        profile?.profile_image
            ? setShowEditForm(true)
            : inputRef?.current?.click();
        setDisplay(true);
    };

    const dispatch = useAppDispatch();

    const { checkSuspention } = useUserStatus();

    const getImgSrc = () => {
        if (profile?.profile_image && !isProfileEdit) {
            return profile?.profile_image;
        } else if (profile?.profile_image && isProfileEdit) {
            return previewImage ?? profile?.profile_image;
        } else if (!profile?.profile_image) {
            return previewImage ?? "/images/placeholder/personPlaceholder.jpg";
        } else {
            return "/images/placeholder/personPlaceholder.jpg";
        }
    };

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={
                    profile
                        ? isLoading || isEditProfileLoading
                        : isCreateProfileLoading
                }
                sx={{ position: "fixed", inset: 0 }}
            />
            <Layout heading="Settings" currentTitle="Account-settings" breadCrumbsItems={[{name:"Settings",href:""}]}>
                <div className={classes.wrapper}>
                    <Formik
                        initialValues={{
                            first_name: profile?.user?.first_name ?? "",
                            middle_name: profile?.user?.middle_name ?? "",
                            last_name: profile?.user?.last_name ?? "",
                            city: profile?.city?.id.toString() ?? "",
                            bio: profile?.bio ?? "",
                            gender: profile?.gender ?? "Male",
                            date_of_birth:
                                profile && profile.date_of_birth
                                    ? parseISO(profile.date_of_birth)
                                    : new Date(
                                          new Date().setFullYear(
                                              new Date().getFullYear() - 16
                                          )
                                      ),
                            skills: profile
                                ? profile?.skills?.map((item) =>
                                      item.id.toString()
                                  )
                                : [],
                            interests: profile
                                ? profile?.interests?.map((item) =>
                                      item.id.toString()
                                  )
                                : [],
                            experience_level: profile?.experience_level ?? "",

                            country: profile
                                ? profile?.country
                                    ? profile?.country?.code
                                    : ""
                                : "",
                            address_line1: profile?.address_line1 ?? "",
                            address_line2: profile?.address_line2 ?? "",
                            language: profile
                                ? profile?.language
                                    ? profile?.language?.code
                                    : ""
                                : "ne",
                            charge_currency: profile
                                ? profile?.charge_currency
                                    ? profile?.charge_currency?.code
                                    : ""
                                : "NPR",
                            profile_visibility:
                                profile?.profile_visibility ?? "",
                            task_preferences: profile?.task_preferences ?? "",
                            profile_image: profile?.profile_image ?? "",
                            designation: profile?.designation ?? "",
                            avatar: profile?.avatar ?? null,
                            referral_code: "",
                        }}
                        enableReinitialize={hasProfile}
                        validationSchema={accountFormSchema}
                        onSubmit={async (values, actions) => {
                            const formData = new FormData();

                            {
                                const newValidatedValues = {
                                    ...values,

                                    date_of_birth: format(
                                        new Date(values.date_of_birth),
                                        "yyyy-MM-dd"
                                    ),
                                    city: values.city,
                                };

                                Object.entries(newValidatedValues).forEach(
                                    (entry) => {
                                        const [key, value] = entry;

                                        if (
                                            entry[0] == "profile_image" &&
                                            isValidURL(entry[1])
                                        ) {
                                            return false;
                                        }
                                        if (key !== "profile_image") {
                                            formData.append(
                                                key,
                                                value ? value?.toString() : ""
                                            );
                                        } else {
                                            formData.append(
                                                "profile_image",
                                                values?.profile_image
                                            );
                                        }

                                        //Do not change
                                        formData.delete("interests");
                                        formData.delete("skills");
                                    }
                                );

                                values?.interests?.forEach((value: any) => {
                                    formData.append("interests", value);
                                });
                                values?.skills?.forEach((value: any) => {
                                    formData.append("skills", value);
                                });

                                {
                                    isProfileEdit
                                        ? editProfile(formData, {
                                              onSuccess: async () => {
                                                  queryClient.invalidateQueries(
                                                      ["user-data"]
                                                  );
                                                  refetch();
                                                  dispatch(
                                                      success({
                                                          description:
                                                              "Profile Edited Successfully.",
                                                          link: "/profile?active_tab=kyc-details",
                                                      })
                                                  );

                                                  setIsProfileEdit(false);
                                              },
                                              onError: (error: any) => {
                                                  toast.error(error?.message);
                                                  const { date_of_birth } =
                                                      error.response.data;

                                                  actions.setFieldError(
                                                      "date_of_birth",
                                                      date_of_birth &&
                                                          date_of_birth[0]
                                                  );
                                              },
                                          })
                                        : createProfile(formData, {
                                              onSuccess: async () => {
                                                  dispatch(
                                                      success({
                                                          btnTitle: "Fill KYC",
                                                          description:
                                                              "Profile Created Successfully. Continue to fill KYC.",
                                                          link: "/profile?active_tab=kyc-details",
                                                      })
                                                  );
                                                  refetch();
                                                  queryClient.invalidateQueries(
                                                      ["user-data"]
                                                  );
                                                  setIsProfileEdit(false);
                                              },
                                              onError: (err: any) => {
                                                  toast.error(err.message);
                                                  const {
                                                      date_of_birth,
                                                      referral_code,
                                                  } = err.response.data;

                                                  actions.setFieldError(
                                                      "date_of_birth",
                                                      date_of_birth &&
                                                          date_of_birth[0]
                                                  );
                                                  referral_code &&
                                                      actions.setFieldError(
                                                          "referral_code",
                                                          referral_code &&
                                                              referral_code[0]
                                                      );
                                              },
                                          });
                                }
                            }
                        }}
                    >
                        {({
                            errors,
                            touched,
                            values,
                            setFieldTouched,
                            setFieldValue,
                            resetForm,
                        }) => (
                            <Form>
                                <Box className="info-container">
                                    <h4
                                        style={{
                                            borderBottom: "1px solid #00000008",
                                            paddingBottom: 12,
                                            marginBottom: 24,
                                            marginTop: 40,
                                        }}
                                    >
                                        General Information
                                    </h4>
                                    <Grid className="content-block" mb={24}>
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Avatar
                                                 {/*<Asterik />*/}
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <Flex>
                                                <figure className="profile-img">
                                                    {!profile ||
                                                    isProfileEdit ? (
                                                        <>
                                                            <IconCamera
                                                                className="camera-icon"
                                                                color="#fff"
                                                                onClick={
                                                                    onButtonClick
                                                                }
                                                            />
                                                            <ImageUpload
                                                                name="profile_image"
                                                                display={
                                                                    display
                                                                }
                                                                setFieldValue={
                                                                    setFieldValue
                                                                }
                                                                setIsEditButtonClicked={
                                                                    setIsProfileEdit
                                                                }
                                                                userId={profile?.id?.toString()}
                                                                ref={inputRef}
                                                                setPreviewImage={
                                                                    setPreviewImage
                                                                }
                                                                onChange={(
                                                                    e: any
                                                                ) => {
                                                                    const files =
                                                                        e.target
                                                                            .files;
                                                                    setFieldValue(
                                                                        "profile_image",
                                                                        files[0]
                                                                    );
                                                                    setDisplay(
                                                                        false
                                                                    );
                                                                    setImage(
                                                                        files[0]
                                                                    );
                                                                    setShowEditForm(
                                                                        !showEditForm
                                                                    );
                                                                }}
                                                                photo={image}
                                                                showEditForm={
                                                                    showEditForm
                                                                }
                                                                setShowEditForm={
                                                                    setShowEditForm
                                                                }
                                                                handleClose={() => {
                                                                    setShowEditForm(
                                                                        false
                                                                    );
                                                                    setDisplay(
                                                                        false
                                                                    );
                                                                }}
                                                                isEditButtonClicked={
                                                                    isProfileEdit
                                                                }
                                                                onPhotoEdit={(
                                                                    data,
                                                                    file
                                                                ) => {
                                                                    setPreviewImage(
                                                                        data
                                                                    );
                                                                    // setBlobUrl(
                                                                    //     data
                                                                    // );
                                                                    setFieldValue(
                                                                        "profile_image",
                                                                        file
                                                                    );
                                                                }}
                                                                onAvatarEdit={(
                                                                    avatar
                                                                ) => {
                                                                    setPreviewImage(
                                                                        avatar.image
                                                                    );
                                                                    setFieldValue(
                                                                        "avatar",
                                                                        avatar.id
                                                                    );
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        ""
                                                    )}
                                                    <Image
                                                        src={
                                                            getImgSrc() as string
                                                        }
                                                        height={148}
                                                        width={148}
                                                        alt="serviceprovider-image"
                                                        style={{
                                                            borderRadius: "50%",
                                                        }}
                                                    />
                                                </figure>

                                                {profile ? (
                                                    isProfileEdit ||
                                                    !profile ? null : (
                                                        <Button
                                                            onClick={() => {
                                                                if (
                                                                    checkSuspention()
                                                                ) {
                                                                    setIsProfileEdit(
                                                                        true
                                                                    );
                                                                } else
                                                                    setIsProfileEdit(
                                                                        false
                                                                    );
                                                            }}
                                                        >
                                                            Edit Profile
                                                        </Button>
                                                    )
                                                ) : (
                                                    ""
                                                )}
                                            </Flex>
                                        </Grid.Col>
                                    </Grid>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Name
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <Group
                                                grow
                                                sx={{
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <InputField
                                                    id="first_name"
                                                    name="first_name"
                                                    placeholder="First Name"
                                                    error={errors.first_name}
                                                    touch={touched.first_name}
                                                    disabled={isInputDisabled}
                                                    marginIgnore
                                                />
                                                <InputField
                                                    id="middle_name"
                                                    name="middle_name"
                                                    placeholder="Middle Name"
                                                    error={errors.middle_name}
                                                    touch={touched.middle_name}
                                                    disabled={isInputDisabled}
                                                    marginIgnore
                                                />
                                                <InputField
                                                    id="last_name"
                                                    name="last_name"
                                                    placeholder="Last Name"
                                                    error={errors.last_name}
                                                    touch={touched.last_name}
                                                    disabled={isInputDisabled}
                                                    marginIgnore
                                                />
                                            </Group>
                                        </Grid.Col>
                                    </Grid>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Date of Birth
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <DateField
                                                id="date_of_birth"
                                                name="date_of_birth"
                                                placeholder="MM/DD/YYYY"
                                                autoFocus={
                                                    errors.date_of_birth
                                                        ? true
                                                        : false
                                                }
                                                error={
                                                    errors.date_of_birth as string
                                                }
                                                touch={
                                                    touched.date_of_birth as boolean
                                                }
                                                icon={
                                                    <IconCalendarEvent
                                                        size={20}
                                                    />
                                                }
                                                minDate={
                                                    new Date(
                                                        new Date().setFullYear(
                                                            new Date().getFullYear() -
                                                                100
                                                        )
                                                    )
                                                }
                                                maxDate={
                                                    new Date(
                                                        new Date().setFullYear(
                                                            new Date().getFullYear() -
                                                                16
                                                        )
                                                    )
                                                }
                                                onChange={(value) => {
                                                    setFieldValue(
                                                        "date_of_birth",
                                                        value
                                                    );
                                                }}
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                            {!isInputDisabled && (
                                                <Text
                                                    component="span"
                                                    sx={(theme) => ({
                                                        fontSize: 12,
                                                        color: theme.colors
                                                            .gray[5],
                                                        // fontStyle: "italic",
                                                    })}
                                                >
                                                    *You must be at least 16
                                                    years of age.
                                                </Text>
                                            )}
                                        </Grid.Col>
                                    </Grid>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Gender
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            {isInputDisabled ? (
                                                <Text
                                                    component="span"
                                                    c={"gray.6"}
                                                >
                                                    {profile?.gender}
                                                </Text>
                                            ) : (
                                                <Radio.Group
                                                    id="gender"
                                                    name="gender"
                                                    value={values.gender}
                                                    mb={24}
                                                    onChange={(gender) =>
                                                        setFieldValue(
                                                            "gender",
                                                            gender
                                                        )
                                                    }
                                                >
                                                    <Group>
                                                        <Radio
                                                            value="Male"
                                                            label="Male"
                                                        />
                                                        <Radio
                                                            value="Female"
                                                            label="Female"
                                                        />
                                                        <Radio
                                                            value="Other"
                                                            label="Other"
                                                        />
                                                    </Group>
                                                </Radio.Group>
                                            )}
                                        </Grid.Col>
                                    </Grid>

                                    <Grid className="info-container">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                About
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            {isInputDisabled ? (
                                                <p
                                                    className={classes.description}
                                                    dangerouslySetInnerHTML={{__html: profile?.bio || ""}}
                                                ></p>

                                            ) : (
                                                <DescriptionField
                                                    id="bio"
                                                    name="bio"
                                                placeholder="Say something about yourself"
                                                error={errors.bio}
                                                touch={touched.bio}
                                                disabled={isInputDisabled}
                                                readOnly={isInputDisabled}
                                                className={isInputDisabled ? classes.description : undefined}
                                                marginIgnore
                                            />

                                            )}
                                        </Grid.Col>
                                    </Grid>
                                </Box>

                                <Box className="info-container">
                                    <h4
                                        style={{
                                            borderBottom: "1px solid #00000008",
                                            paddingBottom: 12,
                                            marginBottom: 24,
                                            marginTop: 40,
                                        }}
                                    >
                                        Address Information
                                    </h4>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Country
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <SelectField
                                                id="country"
                                                name={"country"}
                                                placeholder="Select your country"
                                                data={countryOptions ?? []}
                                                value={values.country}
                                                onChange={(value) => {
                                                    handleCountryChanged(
                                                        value,
                                                        setFieldValue
                                                    );
                                                }}
                                                onBlur={() =>
                                                    setFieldTouched("country")
                                                }
                                                touch={touched.country}
                                                error={errors.country}
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                City
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <SelectField
                                                id="city"
                                                name={"city"}
                                                placeholder="Search and select your city"
                                                data={cityOptions ?? []}
                                                value={values.city}
                                                onSearchChange={debounce(
                                                    (value) =>
                                                        setSearchCity(value),
                                                    500
                                                )}
                                                onChange={(value) => {
                                                    handleCityChanged(
                                                        value,
                                                        setFieldValue
                                                    );
                                                }}
                                                searchable
                                                touch={touched.city}
                                                error={errors.city}
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Address Line 1<Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <InputField
                                                id="address_line1"
                                                name="address_line1"
                                                placeholder="Address Line 1"
                                                error={errors.address_line1}
                                                touch={touched.address_line1}
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Address Line 2
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <InputField
                                                id="address_line2"
                                                name="address_line2"
                                                placeholder="Address Line 2"
                                                error={errors.address_line2}
                                                touch={touched.address_line2}
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>
                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Language
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <SelectField
                                                id="language"
                                                name={"language"}
                                                searchable
                                                placeholder="Select your language"
                                                data={languageOptions}
                                                touch={touched.language}
                                                error={errors.language}
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Box>

                                <Box className="info-container">
                                    <h4
                                        style={{
                                            borderBottom: "1px solid #00000008",
                                            paddingBottom: 12,
                                            marginBottom: 24,
                                            marginTop: 40,
                                        }}
                                    >
                                        Professional Information
                                    </h4>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Skills
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <MultiSelect
                                                id="skills"
                                                data={skillsOptions}
                                                placeholder="Choose your skills"
                                                searchable
                                                name="skills"
                                                error={
                                                    touched.skills &&
                                                    errors.skills
                                                        ? (errors.skills as string)
                                                        : null
                                                }
                                                onChange={(value) => {
                                                    setFieldValue(
                                                        "skills",
                                                        value
                                                    );
                                                }}
                                                size="md"
                                                value={values?.skills}
                                                onBlur={() =>
                                                    setFieldTouched("skills")
                                                }
                                                disabled={isInputDisabled}
                                                radius={8}
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Interests
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <MultiSelect
                                                id="interests"
                                                searchable
                                                data={categoryOptions}
                                                placeholder="Choose your interests"
                                                name="interests"
                                                error={
                                                    touched.interests &&
                                                    errors.interests
                                                        ? (errors.interests as string)
                                                        : null
                                                }
                                                onChange={(value) => {
                                                    setFieldValue(
                                                        "interests",
                                                        value
                                                    );
                                                }}
                                                size="md"
                                                value={values?.interests}
                                                onBlur={() =>
                                                    setFieldTouched("interests")
                                                }
                                                disabled={isInputDisabled}
                                                radius={8}
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Experience
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <SelectField
                                                id="experience_level"
                                                name={"experience_level"}
                                                placeholder="Your experience"
                                                data={[
                                                    {
                                                        value: "beginner",
                                                        label: "Beginner",
                                                    },
                                                    {
                                                        value: "intermediate",
                                                        label: "Intermediate",
                                                    },
                                                    {
                                                        value: "expert",
                                                        label: "Expert",
                                                    },
                                                ]}
                                                touch={touched.experience_level}
                                                error={errors.experience_level}
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>
                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Job Title
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <InputField
                                                id="designation"
                                                name="designation"
                                                placeholder="Job Title"
                                                error={errors.designation}
                                                touch={touched.designation}
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Currency
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <SelectField
                                                id="charge_currency"
                                                name={"charge_currency"}
                                                placeholder="Select your currency"
                                                searchable
                                                data={currencyOptions}
                                                touch={touched.charge_currency}
                                                error={errors.charge_currency}
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Box>

                                <Box className="info-container">
                                    <h4
                                        style={{
                                            borderBottom: "1px solid #00000008",
                                            paddingBottom: 12,
                                            marginBottom: 24,
                                            marginTop: 40,
                                        }}
                                    >
                                        Profile Configurations
                                    </h4>

                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Visibility
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <SelectField
                                                id="profile_visibility"
                                                name={"profile_visibility"}
                                                placeholder="Select your visibility"
                                                data={profileVisibility}
                                                touch={
                                                    touched.profile_visibility
                                                }
                                                error={
                                                    errors.profile_visibility
                                                }
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>
                                    <Grid className="content-block">
                                        <Grid.Col md={2}>
                                            <Text component="p">
                                                Task Preferences
                                                <Asterik />
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={8}>
                                            <SelectField
                                                id="task_preferences"
                                                name={"task_preferences"}
                                                placeholder="Select your preferences"
                                                data={taskPreferences}
                                                touch={touched.task_preferences}
                                                error={errors.task_preferences}
                                                disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>
                                    {!hasProfile && (
                                        <Grid className="content-block">
                                            <Grid.Col md={2}>
                                                <Flex
                                                    align={"center"}
                                                    justify={"start"}
                                                >
                                                    <IconInfoCircle color="#FF9700" />
                                                    <Text ml={4}>
                                                        Have a referral code?
                                                    </Text>
                                                </Flex>
                                            </Grid.Col>
                                            <Grid.Col md={8}>
                                                <TextInput
                                                    id="referral_code"
                                                    name="referral_code"
                                                    placeholder="Referral Code"
                                                    radius="md"
                                                    size="md"
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            "referral_code",
                                                            e.currentTarget
                                                                .value
                                                        )
                                                    }
                                                    error={
                                                        errors.referral_code &&
                                                        touched.referral_code
                                                            ? errors.referral_code
                                                            : null
                                                    }
                                                    sx={(theme) => ({
                                                        ["& .mantine-TextInput-input"]:
                                                            {
                                                                border: "2px dotted #ced4da",
                                                                color:
                                                                    theme.colorScheme ===
                                                                    "dark"
                                                                        ? theme
                                                                              .colors
                                                                              .dark[0]
                                                                        : theme
                                                                              .colors
                                                                              .gray[8],
                                                                fontWeight: 400,
                                                                marginBottom: 6,
                                                            },
                                                    })}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    )}
                                </Box>

                                {profile && isProfileEdit ? (
                                    <Button
                                        type="submit"
                                        loading={Boolean(isEditProfileLoading)}
                                        onClick={() => {
                                            if (errors) {
                                                scrollToElement(
                                                    Object.keys(errors)[0],
                                                    "smooth"
                                                );
                                            }
                                        }}
                                    >
                                        Submit
                                    </Button>
                                ) : null}

                                {!profile && (
                                    <Group>
                                        <Button
                                            variant="outline"
                                            size="md"
                                            onClick={() => resetForm()}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            type="submit"
                                            size="md"
                                            loading={Boolean(
                                                isCreateProfileLoading
                                            )}
                                            onClick={() => {
                                                if (errors) {
                                                    scrollToElement(
                                                        Object.keys(errors)[0],
                                                        "smooth"
                                                    );
                                                }
                                            }}
                                        >
                                            Submit
                                        </Button>
                                    </Group>
                                )}
                            </Form>
                        )}
                    </Formik>
                </div>
            </Layout>
        </>
    );
};
export default Account;
