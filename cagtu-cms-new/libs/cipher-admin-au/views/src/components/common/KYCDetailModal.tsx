import { Badge, SkeletonKYCDetail, TextAreaField } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    getFileName,
    getTimeInAMPM,
    KYCDocUnverifyResult,
    KYCResult,
    stringValidate,
    useDark,
    useIconColorMode,
} from '@cagtu-cms/util-formatter';
import { Accordion, Alert, Avatar, Box, Button, Divider, Grid, Group, Image, Modal, ModalProps, Text, Title, useMantineTheme } from '@mantine/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { UseMutationResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import _ from 'lodash';
import { useContext, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import {
    IconBuildingBank,
    IconChecks,
    IconCircleCheck,
    IconCoin,
    IconCurrencyDollar,
    IconFolder,
    IconMail,
    IconMapPin,
    IconPhone,
    IconPower,
    IconQuestionCircle,
} from '@tabler/icons';

dayjs.extend(relativeTime);

interface KYCDetailModalProps {
    opened: boolean;
    onClose: () => void;
    title?: string;
    data: KYCResult;
    isLoading: boolean;
    handleAddVerify: UseMutationResult<AxiosResponse<any, any>, unknown, boolean, unknown>;
    handleAddUnverify: UseMutationResult<
        any,
        void,
        {
            is_address_verified: boolean;
            comment: string;
        },
        unknown
    >;
    handleCompanyAddVerify: UseMutationResult<AxiosResponse<any, any>, unknown, boolean, unknown>;
    handleCompanyAddUnverify: UseMutationResult<
        any,
        void,
        {
            is_company_address_verified: boolean;
            company_address_comment: string;
        },
        unknown
    >;
    handleKycDocVerify: UseMutationResult<
        any,
        void,
        {
            is_verified: boolean;
            id: number;
        },
        unknown
    >;
    handleKycDocUnverify: UseMutationResult<any, void, KYCDocUnverifyResult, unknown>;

    handleBankDetailVerify: UseMutationResult<
        any,
        void,
        {
            is_verified: boolean;
            id: number;
        },
        unknown
    >;
    handleCompanyProfileVerify: UseMutationResult<
        any,
        void,
        {
            is_profile_verified: boolean;
            id: number;
        },
        unknown
    >;
}

const KYCDetailModal = ({
    onClose,
    opened,
    title,
    isLoading,
    data,
    handleAddVerify,
    handleAddUnverify,
    handleCompanyAddVerify,
    handleCompanyAddUnverify,
    handleKycDocVerify,
    handleKycDocUnverify,
    handleCompanyProfileVerify,
    handleBankDetailVerify,
    ...restProps
}: KYCDetailModalProps & Partial<ModalProps>) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [iconColorMode] = useIconColorMode();
    const theme = useMantineTheme();
    const [dark] = useDark();
    const [showKycComment, setShowKycComment] = useState<number[]>([]);
    const [showAddressComment, setShowAddressComment] = useState<boolean>(false);
    const [showCompanyAddressComment, setShowCompanyAddressComment] = useState<boolean>(false);

    return (
        <Modal
            {...restProps}
            opened={opened}
            onClose={onClose}
            centered
            title={
                title && (
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        {title}
                    </Title>
                )
            }>
            {isLoading ? (
                <SkeletonKYCDetail />
            ) : (
                <>
                    {title && <Divider mb={20} />}
                    <Group position="apart" align="normal" mb={30}>
                        <Group position="left" spacing={15} align="normal">
                            <Avatar src={`${data?.user?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                            <Box>
                                <Title order={5} weight={600} mb={5}>
                                    {`${data?.user?.first_name ?? ''} ${data?.user?.middle_name ?? ''} ${data?.user?.last_name ?? ''}`}
                                    <Text color="dimmed" size={13} weight={400}>
                                        @{data?.user?.username}
                                    </Text>
                                </Title>
                                <Group spacing={5} mb={3}>
                                    <IconMail size={16} stroke={1.75} color={iconColorMode} />
                                    <Text component="span" color="dimmed">
                                        {data?.user?.email ?? '-'}
                                    </Text>
                                </Group>
                                <Group spacing={5}>
                                    <IconPhone size={16} stroke={1.75} color={iconColorMode} />
                                    <Text component="span" color="dimmed">
                                        {data?.user?.phone ?? '-'}
                                    </Text>
                                </Group>
                            </Box>
                        </Group>
                        <Box>
                            <Group position="right" spacing={5} mb={10}>
                                <IconMapPin size={16} stroke={1.75} />
                                <Text component="span" color="dimmed">
                                    {data?.country?.name}
                                </Text>
                            </Group>
                            <Group position="right" mb={4}>
                                <Text size="xs" weight={500}>
                                    Submitted On:{' '}
                                    <Text component="span" color="dimmed">
                                        {converDateFromIsonString(data?.created_at)}
                                    </Text>
                                </Text>
                            </Group>
                            <Group position="right">
                                <Text size="xs" weight={500}>
                                    Updated On:{' '}
                                    <Text component="span" color="dimmed">
                                        {dayjs(data?.updated_at).fromNow()}
                                    </Text>
                                </Text>
                            </Group>
                        </Box>
                    </Group>
                    <Title order={6} weight={600} mb={10}>
                        Basic Information
                    </Title>
                    <Divider mb={20} variant="dashed" />
                    <Grid gutter={30} mb={15}>
                        <Grid.Col>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Bio
                            </Text>
                            <Text color="dimmed">{data?.user?.bio ? _.upperFirst(data?.user?.bio) : '-'}</Text>
                        </Grid.Col>
                        <Grid.Col md={3}>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Address
                            </Text>
                            <Text color="dimmed">{data?.address}</Text>
                        </Grid.Col>
                        {data?.is_company && (
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Organization
                                </Text>
                                <Text color="dimmed">{data?.organization_name ?? '-'}</Text>
                            </Grid.Col>
                        )}
                        <Grid.Col md={3}>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                KYC Verified
                            </Text>
                            <Box>
                                <Badge name={data?.is_kyc_verified ? 'Yes' : 'No'} color={data?.is_kyc_verified ? 'green' : 'red'} />
                            </Box>
                        </Grid.Col>
                        <Grid.Col md={3}>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Address Verified
                            </Text>
                            <Box>
                                <Badge name={data?.is_address_verified ? 'Yes' : 'No'} color={data?.is_address_verified ? 'green' : 'red'} />
                            </Box>
                        </Grid.Col>
                    </Grid>
                    {/* Company detail has been removed from response for now and its giving error so this part is commmented for now.
                    if in future comapany detail is needed and provided in response simply uncomment this part and it should work perfectly.
                    */}

                    {/* {data?.is_company && (
                        <>
                            <Title order={6} weight={600} mb={10}>
                                Company Information
                            </Title>
                            <Divider mb={20} variant="dashed" />
                            <Group position="apart" align="normal" mb={20}>
                                <Group position="left" spacing={15} align="normal">
                                    <Avatar src={`${data?.company?.profile_image ?? ''}`} alt="company-profile" size={100} radius="md" />
                                    <Box>
                                        <Group spacing={5} mb={3}>
                                            <Title order={5} weight={600}>
                                                {data?.company?.organization_name}
                                            </Title>
                                            <IconCircleCheck
                                                size={20}
                                                stroke={1.75}
                                                color={
                                                    data?.company?.is_profile_verified
                                                        ? theme.colors['green'][6]
                                                        : dark
                                                        ? theme.colors['dark'][3]
                                                        : theme.colors['dark'][0]
                                                }
                                            />
                                        </Group>
                                        <Group spacing={5} mb={3}>
                                            <IconMapPin size={16} stroke={1.75} color={iconColorMode} />
                                            <Text color="dimmed">{data?.company?.address_line1}</Text>
                                        </Group>
                                        <Group spacing={5} mb={3}>
                                            <IconCurrencyDollar size={16} stroke={1.75} color={iconColorMode} />
                                            <Text color="dimmed">
                                                <Text component="span">Rate: </Text>
                                                {data?.company?.hourly_rate}/hr
                                            </Text>
                                        </Group>
                                        <Group spacing={5}>
                                            <IconCoin size={16} stroke={1.75} color={iconColorMode} />
                                            <Text color="dimmed">
                                                <Text component="span">Curr: </Text>
                                                {data?.company?.charge_currency?.name}
                                            </Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Box>
                                    <Group position="right" spacing={2} mb={10}>
                                        <Text color="dimmed">
                                            <IconPower size={16} stroke={1.75} color={iconColorMode} />
                                            <Text component="span">Status: </Text>
                                            <Badge
                                                name={data?.company?.status ? 'Active' : 'Inactive'}
                                                color={data?.company?.status ? 'green' : 'red'}
                                                size="md"
                                                styles={{ inner: { fontSize: 12, fontWeight: 500 } }}
                                            />
                                        </Text>
                                    </Group>
                                    <Group position="right" mb={3}>
                                        <Text size="xs" weight={500}>
                                            Estd. Date:{' '}
                                            <Text component="span" color="dimmed">
                                                {data?.company?.established_date  ? converDateFromIsonString(data?.company?.established_date) : 'N/A'}
                                            </Text>
                                        </Text>
                                    </Group>
                                    <Group position="right" spacing={5} mb={3}>
                                        <Text size="xs" weight={500}>
                                            Open:{' '}
                                            <Text component="span" color="dimmed">
                                                {data?.company?.available_hour?.from_hour ? getTimeInAMPM(data?.company?.available_hour?.from_hour) : 'N/A'}
                                            </Text>
                                        </Text>
                                        -
                                        <Text size="xs" weight={500}>
                                            Closed:{' '}
                                            <Text component="span" color="dimmed">
                                                {data?.company?.available_hour?.to_hour ? getTimeInAMPM(data?.company?.available_hour?.to_hour) : 'N/A'}
                                            </Text>
                                        </Text>
                                    </Group>
                                    <Group position="right" spacing={5} mb={3}>
                                        <Text size="xs" weight={500}>
                                            Submitted On:{' '}
                                            <Text component="span" color="dimmed">
                                                {data?.company?.created_at ? converDateFromIsonString(data?.company?.created_at) : 'N/A'}
                                            </Text>
                                        </Text>
                                    </Group>
                                    <Group position="right">
                                        <Text size="xs" weight={500}>
                                            Updated On:{' '}
                                            <Text component="span" color="dimmed">
                                                {data?.company?.updated_at ? dayjs(data?.company?.updated_at).fromNow() : 'N/A'}
                                            </Text>
                                        </Text>
                                    </Group>
                                </Box>
                            </Group>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Description
                            </Text>
                            <Text color="dimmed" mb={20}>
                                {data?.company?.description ?? '-'}
                            </Text>
                            <Grid gutter={30} mb={10}>
                                <Grid.Col md={3}>
                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                        Address Line 1
                                    </Text>
                                    <Text color="dimmed">{data?.company?.address_line1 ?? '-'}</Text>
                                </Grid.Col>
                                <Grid.Col md={3}>
                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                        Address Line 2
                                    </Text>
                                    <Text color="dimmed">{data?.company?.address_line2 ?? '-'}</Text>
                                </Grid.Col>
                                <Grid.Col md={3}>
                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                        KYC Verified
                                    </Text>
                                    <Box>
                                        <Badge
                                            name={data?.is_company_kyc_verified ? 'Yes' : 'No'}
                                            color={data?.is_company_kyc_verified ? 'green' : 'red'}
                                        />
                                    </Box>
                                </Grid.Col>
                                <Grid.Col md={3}>
                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                        Address Verified
                                    </Text>
                                    <Box>
                                        <Badge
                                            name={data?.is_company_address_verified ? 'Yes' : 'No'}
                                            color={data?.is_company_address_verified ? 'green' : 'red'}
                                        />
                                    </Box>
                                </Grid.Col>
                            </Grid>
                            <Divider mb={20} variant="dashed" />
                            <Title order={6} weight={600} mb={15}>
                                Manager Detail
                            </Title>
                            <Grid gutter={30} mb={15}>
                                <Grid.Col md={3}>
                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                        Full Name
                                    </Text>
                                    <Text color="dimmed">{data?.company?.manager?.full_name}</Text>
                                </Grid.Col>
                                <Grid.Col md={3}>
                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                        Username
                                    </Text>
                                    <Text color="dimmed">{data?.company?.manager?.username ?? '-'}</Text>
                                </Grid.Col>
                                <Grid.Col md={3}>
                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                        Email
                                    </Text>
                                    <Text color="dimmed">{data?.company?.manager?.email ?? '-'}</Text>
                                </Grid.Col>
                                <Grid.Col md={3}>
                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                        Phone
                                    </Text>
                                    <Text color="dimmed">{data?.company?.manager?.phone ?? '-'}</Text>
                                </Grid.Col>
                            </Grid>
                        </>
                    )} */}
                    <Title order={6} weight={600} mb={10}>
                        KYC Documents
                    </Title>
                    <Divider mb={20} variant="dashed" />
                    <Accordion
                        variant="contained"
                        styles={{ control: { padding: `${12}px ${10}px ${12}px ${15}px` }, label: { fontSize: 13 }, content: { fontSize: 13 } }}
                        mb={30}>
                        {data?.kyc_documents.length ? (
                            data?.kyc_documents.map((doc, index) => (
                                <Accordion.Item key={index} value={String(index)}>
                                    <Accordion.Control icon={<IconFolder size={18} stroke={1.75} color={iconColorMode} />}>
                                        <Group spacing={5}>
                                            <Text component="span" weight={500}>
                                                {_.upperFirst(doc?.document_type?.name ?? '')}
                                            </Text>
                                            <IconCircleCheck
                                                size={18}
                                                stroke={1.75}
                                                color={
                                                    doc?.is_verified
                                                        ? theme.colors['green'][6]
                                                        : dark
                                                        ? theme.colors['dark'][3]
                                                        : theme.colors['dark'][0]
                                                }
                                            />
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Grid gutter={30} mb={1}>
                                            <Grid.Col md={3}>
                                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                    Document Id
                                                </Text>
                                                <Text color="dimmed">{doc?.document_id ?? '-'}</Text>
                                            </Grid.Col>
                                            <Grid.Col md={3}>
                                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                    Issuer Organization
                                                </Text>
                                                <Text color="dimmed">{doc?.issuer_organization ?? '-'}</Text>
                                            </Grid.Col>
                                            <Grid.Col md={3}>
                                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                    Issued Date
                                                </Text>
                                                <Text color="dimmed">{doc?.issued_date ?? '-'}</Text>
                                            </Grid.Col>
                                            <Grid.Col md={3}>
                                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                    Expiry Date
                                                </Text>
                                                <Text color="dimmed">{doc?.valid_through ?? '-'}</Text>
                                            </Grid.Col>
                                        </Grid>
                                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                            Documents
                                        </Text>
                                        <Group position="left" mb={15}>
                                            <Text
                                                component="a"
                                                size={12}
                                                weight={500}
                                                href={doc?.file}
                                                target="_blank"
                                                color="blue"
                                                download={doc?.file}>
                                                <Group position="left" spacing={10}>
                                                    <Image src={doc?.file ?? ''} width={54} height={54} radius="md" />
                                                    {getFileName(doc?.file)}
                                                </Group>
                                            </Text>
                                        </Group>
                                        {doc?.is_verified ? (
                                            <Badge
                                                color="teal"
                                                name="Verified"
                                                leftSection={<IconChecks size={16} stroke={1.75} style={{ position: 'relative', top: 4 }} />}
                                                sx={{ fontWeight: 500 }}
                                            />
                                        ) : (
                                            (is_superuser || user_permissions?.includes('change_kyc')) && (
                                                <>
                                                    <Button
                                                        compact
                                                        variant="default"
                                                        color="gray"
                                                        sx={{ fontWeight: 500, fontSize: 12 }}
                                                        loading={handleKycDocVerify.isLoading}
                                                        onClick={() => handleKycDocVerify.mutate({ is_verified: true, id: doc?.id })}>
                                                        Verify
                                                    </Button>
                                                    <Button
                                                        ml={10}
                                                        compact
                                                        variant="default"
                                                        // color="red"
                                                        sx={{ fontWeight: 500, fontSize: 12 }}
                                                        onClick={() =>
                                                            setShowKycComment((prevState) =>
                                                                prevState.length > 0 && prevState.includes(doc?.id)
                                                                    ? prevState.filter((val) => val !== doc?.id)
                                                                    : [...prevState, doc?.id]
                                                            )
                                                        }>
                                                        {_.isNull(doc?.comment)
                                                            ? _.isNull(doc?.comment) && !showKycComment.includes(doc?.id)
                                                                ? 'Add Comment Instead'
                                                                : 'Hide Comment'
                                                            : showKycComment.includes(doc?.id)
                                                            ? 'Hide Comment'
                                                            : 'Show Comment'}
                                                    </Button>
                                                </>
                                            )
                                        )}
                                        {showKycComment.includes(doc?.id) && (
                                            <Formik
                                                enableReinitialize
                                                initialValues={{ comment: _.isNull(doc?.comment) ? '' : doc?.comment }}
                                                validationSchema={Yup.object().shape({
                                                    comment: stringValidate.min(2, 'Must be 2 characters or more').nullable(true),
                                                })}
                                                onSubmit={(values, actions) => {
                                                    handleKycDocUnverify.mutate(
                                                        { is_verified: false, comment: values?.comment, id: doc?.id },
                                                        {
                                                            onSuccess: () => {
                                                                actions.resetForm();
                                                            },
                                                        }
                                                    );
                                                }}>
                                                {({ errors, touched }) => (
                                                    <Form>
                                                        <TextAreaField name="comment" error={errors.comment} touch={touched.comment} mt={15} />
                                                        <Button
                                                            type="submit"
                                                            compact
                                                            sx={{ fontWeight: 500, fontSize: 12 }}
                                                            loading={handleKycDocUnverify.isLoading}>
                                                            Submit
                                                        </Button>
                                                    </Form>
                                                )}
                                            </Formik>
                                        )}
                                    </Accordion.Panel>
                                </Accordion.Item>
                            ))
                        ) : (
                            <Alert icon={<IconQuestionCircle size={24} stroke={1.75} />} color="blue">
                                No KYC documents are available
                            </Alert>
                        )}
                    </Accordion>
                    <Title order={6} weight={600} mb={10}>
                        Bank Details
                    </Title>
                    <Divider mb={20} variant="dashed" />
                    <Accordion
                        variant="contained"
                        styles={{
                            control: { padding: `${12}px ${10}px ${12}px ${15}px` },
                            label: { fontSize: 13 },
                            content: { fontSize: 13 },
                        }}
                        mb={30}>
                        {data?.bank_details.length ? (
                            data?.bank_details.map((bank, index) => (
                                <Accordion.Item key={index} value={String(index)}>
                                    <Accordion.Control icon={<IconBuildingBank size={18} stroke={1.75} color={iconColorMode} />}>
                                        <Group spacing={5}>
                                            <Text component="span" weight={500}>
                                                {bank?.bank_name ?? '_'}
                                            </Text>
                                            <IconCircleCheck
                                                size={18}
                                                stroke={1.75}
                                                color={
                                                    bank?.is_verified
                                                        ? theme.colors['green'][6]
                                                        : dark
                                                        ? theme.colors['dark'][3]
                                                        : theme.colors['dark'][0]
                                                }
                                            />
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Grid gutter={30} mb={1}>
                                            <Grid.Col md={7} pb={0}>
                                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                    Bank Name
                                                </Text>
                                                <Text color="dimmed">{bank?.bank_name ?? '-'}</Text>
                                            </Grid.Col>
                                            {/* <Grid.Col md={5} pb={0}>
                                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                    Branch Name
                                                </Text>
                                                <Text color="dimmed">{bank?.branch_name? ?? '-'}</Text>
                                            </Grid.Col> */}
                                            <Grid.Col md={3}>
                                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                    Account Name
                                                </Text>
                                                <Text color="dimmed">{bank?.bank_account_name ?? '-'}</Text>
                                            </Grid.Col>
                                            <Grid.Col md={3}>
                                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                    Account Number
                                                </Text>
                                                <Text color="dimmed">{bank?.bank_account_number ?? '-'}</Text>
                                            </Grid.Col>
                                            <Grid.Col md={3}>
                                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                    Primary
                                                </Text>
                                                <Box>
                                                    <Badge name={bank?.is_primary ? 'Yes' : 'No'} color={bank?.is_primary ? 'green' : 'red'} />
                                                </Box>
                                            </Grid.Col>
                                            <Grid.Col md={3}>
                                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                    Verified
                                                </Text>
                                                <Box>
                                                    <Badge name={bank?.is_verified ? 'Yes' : 'No'} color={bank?.is_verified ? 'green' : 'red'} />
                                                </Box>
                                            </Grid.Col>
                                        </Grid>
                                        {bank?.is_verified ? (
                                            <Badge
                                                color="teal"
                                                name="Verified"
                                                leftSection={<IconChecks size={16} stroke={1.75} style={{ position: 'relative', top: 4 }} />}
                                                sx={{ fontWeight: 500 }}
                                            />
                                        ) : (
                                            (is_superuser || user_permissions?.includes('change_kyc')) && (
                                                <Button
                                                    compact
                                                    variant="default"
                                                    color="gray"
                                                    sx={{ fontWeight: 500, fontSize: 12 }}
                                                    loading={handleBankDetailVerify.isLoading}
                                                    onClick={() => handleBankDetailVerify.mutate({ is_verified: true, id: bank?.id })}>
                                                    Verify
                                                </Button>
                                            )
                                        )}
                                    </Accordion.Panel>
                                </Accordion.Item>
                            ))
                        ) : (
                            <Alert icon={<IconQuestionCircle size={24} stroke={1.75} />} color="blue">
                                No Bank Details are available
                            </Alert>
                        )}
                    </Accordion>
                    {(is_superuser || user_permissions?.includes('change_kyc')) && (
                        <>
                            <Title order={6} weight={600} mb={10}>
                                KYC Verification
                            </Title>
                            <Divider mb={20} variant="dashed" />
                            <Group position="apart">
                                <Text weight={500}>1. Verify Address</Text>
                                {data?.is_address_verified ? (
                                    <Badge
                                        color="teal"
                                        name="Verified"
                                        leftSection={<IconChecks size={18} stroke={1.75} style={{ position: 'relative', top: 4 }} />}
                                        sx={{ fontWeight: 500 }}
                                    />
                                ) : (
                                    <Group position="right" spacing={10}>
                                        <Button
                                            compact
                                            variant="default"
                                            color="gray"
                                            sx={{ fontWeight: 500, fontSize: 12 }}
                                            loading={handleAddVerify.isLoading}
                                            onClick={() => handleAddVerify.mutate(true)}>
                                            Verify
                                        </Button>
                                        <Button
                                            compact
                                            variant="default"
                                            color="gray"
                                            sx={{ fontWeight: 500, fontSize: 12 }}
                                            loading={handleAddVerify.isLoading}
                                            onClick={() => setShowAddressComment(!showAddressComment)}>
                                            {_.isNull(data?.comment)
                                                ? _.isNull(data?.comment) && !showAddressComment
                                                    ? 'Add Comment Instead'
                                                    : 'Hide Comment'
                                                : showAddressComment
                                                ? 'Hide Comment'
                                                : 'Show Comment'}
                                        </Button>
                                    </Group>
                                )}
                            </Group>
                            {showAddressComment && (
                                <Formik
                                    enableReinitialize
                                    initialValues={{ comment: _.isNull(data?.comment) ? '' : data?.comment }}
                                    validationSchema={Yup.object().shape({
                                        comment: stringValidate.min(2, 'Must be 2 characters or more').nullable(true),
                                    })}
                                    onSubmit={(values, actions) => {
                                        handleAddUnverify.mutate(
                                            { is_address_verified: false, comment: values?.comment },
                                            {
                                                onSuccess: () => {
                                                    actions.resetForm();
                                                },
                                            }
                                        );
                                    }}>
                                    {({ errors, touched }) => (
                                        <Form>
                                            <TextAreaField name="comment" error={errors.comment} touch={touched.comment} mt={15} />
                                            <Button
                                                type="submit"
                                                compact
                                                sx={{ fontWeight: 500, fontSize: 12 }}
                                                loading={handleAddUnverify.isLoading}>
                                                Submit
                                            </Button>
                                        </Form>
                                    )}
                                </Formik>
                            )}
                            {data?.is_company && (
                                <>
                                    <Divider my={12} />
                                    <Group position="apart">
                                        <Text weight={500}>2. Verify Company Address</Text>
                                        {data?.is_company_address_verified ? (
                                            <Badge
                                                color="teal"
                                                name="Verified"
                                                leftSection={<IconChecks size={18} stroke={1.75} style={{ position: 'relative', top: 4 }} />}
                                                sx={{ fontWeight: 500 }}
                                            />
                                        ) : (
                                            <Group position="right" spacing={10}>
                                                <Button
                                                    compact
                                                    variant="default"
                                                    color="gray"
                                                    sx={{ fontWeight: 500, fontSize: 12 }}
                                                    loading={handleCompanyAddVerify.isLoading}
                                                    onClick={() => handleCompanyAddVerify.mutate(true)}>
                                                    Verify
                                                </Button>
                                                <Button
                                                    compact
                                                    variant="default"
                                                    color="gray"
                                                    sx={{ fontWeight: 500, fontSize: 12 }}
                                                    loading={handleAddVerify.isLoading}
                                                    onClick={() => setShowCompanyAddressComment(!showCompanyAddressComment)}>
                                                    {_.isNull(data?.company_address_comment)
                                                        ? _.isNull(data?.company_address_comment) && !showCompanyAddressComment
                                                            ? 'Add Comment Instead'
                                                            : 'Hide Comment'
                                                        : showCompanyAddressComment
                                                        ? 'Hide Comment'
                                                        : 'Show Comment'}
                                                </Button>
                                            </Group>
                                        )}
                                    </Group>
                                    {showCompanyAddressComment && (
                                        <Formik
                                            enableReinitialize
                                            initialValues={{ comment: _.isNull(data?.company_address_comment) ? '' : data?.company_address_comment }}
                                            validationSchema={Yup.object().shape({
                                                comment: stringValidate.min(2, 'Must be 2 characters or more').nullable(true),
                                            })}
                                            onSubmit={(values, actions) => {
                                                handleCompanyAddUnverify.mutate(
                                                    { is_company_address_verified: false, company_address_comment: values?.comment },
                                                    {
                                                        onSuccess: () => {
                                                            actions.resetForm();
                                                        },
                                                    }
                                                );
                                            }}>
                                            {({ errors, touched }) => (
                                                <Form>
                                                    <TextAreaField name="comment" error={errors.comment} touch={touched.comment} mt={15} />
                                                    <Button
                                                        type="submit"
                                                        compact
                                                        sx={{ fontWeight: 500, fontSize: 12 }}
                                                        loading={handleCompanyAddUnverify.isLoading}>
                                                        Submit
                                                    </Button>
                                                </Form>
                                            )}
                                        </Formik>
                                    )}
                                    <Divider my={12} />

                                    <Group position="apart">
                                        <Text weight={500}>3. Verify Company Profile</Text>
                                        {data?.company?.is_profile_verified ? (
                                            <Badge
                                                color="teal"
                                                name="Verified"
                                                leftSection={<IconChecks size={18} stroke={1.75} style={{ position: 'relative', top: 4 }} />}
                                                sx={{ fontWeight: 500 }}
                                            />
                                        ) : (
                                            <Button
                                                compact
                                                variant="default"
                                                color="gray"
                                                sx={{ fontWeight: 500, fontSize: 12 }}
                                                loading={handleCompanyProfileVerify.isLoading}
                                                onClick={() =>
                                                    handleCompanyProfileVerify.mutate({ is_profile_verified: true, id: data?.company?.id })
                                                }>
                                                Verify
                                            </Button>
                                        )}
                                    </Group>
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </Modal>
    );
};

export default KYCDetailModal;
