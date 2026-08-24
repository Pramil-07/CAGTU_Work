import {
    Accordion,
    ActionIcon,
    Alert,
    Badge,
    Box,
    Divider,
    Flex,
    Grid,
    Text,
} from "@mantine/core";
import {
    IconAlertCircle,
    IconCircleCheck,
    IconCirclePlus,
    IconCircleX,
    IconFolder,
    IconMapPin,
    IconPencil,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";

import { useKycStyles } from "@/styles/components/KycStyles";
import type { KYCDocumentProps } from "@/types/kyc/KyCDocumentProps";
import type { KYCResponse } from "@/types/kyc/KycResponse";

import AddNewDocumentForm from "./AddNewDocumentForm";
import EditKycDocumentForm from "./EditKycDocumentForm";
import EditKycForm from "./EditKycForm";

export const KYCStatus = ({
    KycData,
    KycDocuments,
}: {
    KycData: KYCResponse|undefined;
    KycDocuments: KYCDocumentProps|undefined;
}) => {
    const { classes, theme } = useKycStyles();
    const [editKycOpened, setEditKycOpened] = useState(false);
    const [editKycDocumentOpened, setEditKycDocumentOpened] = useState(false);
    const [addDocumentOpened, setAddDocumentOpened] = useState(false);
    const [documentID, setDocumentID] = useState<number>();

    return (
        <>
            <Box className={classes.wrapper}>
                <Flex>
                    <h4>Basic Details</h4>
                    {!KycData?.is_kyc_verified && (
                        <ActionIcon
                            color="gray.6"
                            onClick={() => setEditKycOpened(true)}
                        >
                            <IconPencil size={20} />
                        </ActionIcon>
                    )}
                </Flex>
                <Divider mb={16} />
                <Flex
                    sx={{
                        [theme.fn.smallerThan("md")]: {
                            flexDirection: "column",
                            alignItems: "start",
                        },
                    }}
                >
                    <Flex
                        align={"flex-start"}
                        gap={16}
                        sx={{
                            flexWrap: "wrap",
                        }}
                    >
                        <Image
                            src={
                                KycData?.logo ??
                                "/images/placeholder/personPlaceholder.jpg"
                            }
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            alt={`img-${KycData?.full_name}`}
                            height={120}
                            width={120}
                            style={{
                                objectFit: "cover",
                                borderRadius: 16,
                                marginBottom: 8,
                            }}
                        />
                        <Box
                            sx={{
                                [theme.fn.smallerThan("md")]: {
                                    marginBottom: 16,
                                },
                            }}
                        >
                            <Text component="h4" size={20} mb={0}>
                                {KycData?.is_company
                                    ? KycData?.organization_name
                                    : KycData?.full_name}
                            </Text>
                            <Text component="p" color="gray.6">
                                {KycData?.user?.email}
                            </Text>
                        </Box>
                    </Flex>
                    <Box
                        sx={{
                            textAlign: "right",
                            [theme.fn.smallerThan("md")]: {
                                textAlign: "left",
                            },
                        }}
                    >
                        <Flex
                            align={"center"}
                            justify={"flex-end"}
                            gap={2}
                            sx={{
                                [theme.fn.smallerThan("md")]: {
                                    justifyContent: "start",
                                },
                            }}
                        >
                            <IconMapPin size={16} color="gray" />
                            <p>{KycData?.address}</p>
                        </Flex>
                        <p>
                            <span>Submitted On: </span>
                            {KycData
                                ? format(
                                      new Date(KycData?.created_at),
                                      "dd MMM yyyy"
                                  )
                                : ""}
                        </p>
                        <p>
                            <span>Updated On: </span>
                            {KycData
                                ? format(
                                      new Date(KycData?.updated_at),
                                      "dd MMM yyyy"
                                  )
                                : ""}
                        </p>
                    </Box>
                </Flex>
                <Divider mt={24} />
                <Grid mt={4} mb={4} className="basic-details">
                    <Grid.Col md={4} xs={12}>
                        <h4>Address</h4>
                        <p>{KycData?.address}</p>
                    </Grid.Col>
                    <Grid.Col md={4} xs={12}>
                        <h4>KYC Verified</h4>
                        {KycData?.is_kyc_verified ? (
                            <Badge
                                color="green"
                                radius="sm"
                                size="lg"
                                sx={{
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                }}
                            >
                                Verified
                            </Badge>
                        ) : (
                            <Badge
                                color="yellow.5"
                                radius="sm"
                                size="lg"
                                sx={{
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                }}
                            >
                                Pending
                            </Badge>
                        )}
                    </Grid.Col>
                    <Grid.Col md={4} xs={12}>
                        <h4>Address Verified</h4>
                        {KycData?.is_address_verified ? (
                            <Badge
                                color="green"
                                radius="sm"
                                size="lg"
                                sx={{
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                }}
                            >
                                Verified
                            </Badge>
                        ) : (
                            <Badge
                                color="yellow.5"
                                radius="sm"
                                size="lg"
                                sx={{
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                }}
                            >
                                Pending
                            </Badge>
                        )}
                    </Grid.Col>
                </Grid>
                <h4>KYC Documents</h4>
                <Divider variant="dashed" mb={16} />
                <Accordion>
                    {KycDocuments?.map((item) => {
                        return (
                            <>
                                <Accordion.Item
                                    value={item?.document_type?.name}
                                    mb={8}
                                >
                                    <Accordion.Control
                                        icon={<IconFolder size={18} />}
                                    >
                                        <Box
                                            sx={{
                                                display: "inline-flex",
                                            }}
                                        >
                                            <Text mr={4}>
                                                {item?.document_type?.name}
                                            </Text>
                                            {item?.is_verified ? (
                                                <IconCircleCheck
                                                    size={20}
                                                    color={
                                                        theme.colors.green[5]
                                                    }
                                                />
                                            ) : (
                                                <IconCircleX
                                                    size={20}
                                                    color={theme.colors.red[5]}
                                                />
                                            )}
                                        </Box>
                                    </Accordion.Control>
                                    <Accordion.Panel
                                        sx={{ position: "relative" }}
                                    >
                                        <Grid>
                                            <Grid.Col md={3} sm={6} xs={12}>
                                                <h4>Document ID</h4>
                                                <p>{item?.document_id}</p>
                                            </Grid.Col>
                                            <Grid.Col md={3} sm={6} xs={12}>
                                                <h4>Issued by</h4>
                                                <p>
                                                    {item?.issuer_organization}
                                                </p>
                                            </Grid.Col>
                                            <Grid.Col md={3} sm={6} xs={12}>
                                                <h4>Issued Date</h4>
                                                <p>{item?.issued_date}</p>
                                            </Grid.Col>
                                            {item?.valid_through && (
                                                <Grid.Col md={3} sm={6} xs={12}>
                                                    <h4>Valid Through</h4>
                                                    <p>{item?.valid_through}</p>
                                                </Grid.Col>
                                            )}
                                            <Grid.Col md={3} sm={6} xs={12}>
                                                <h4>Documents</h4>
                                                <Image
                                                    src={item?.file}
                                                    alt={`document-${item?.document_type?.name}`}
                                                    height={80}
                                                    width={80}
                                                    placeholder="blur"
                                                    blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                                                    style={{
                                                        borderRadius: 10,
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                        {item?.comment && (
                                            <Alert
                                                sx={{
                                                    marginTop: 16,
                                                    backgroundColor:
                                                        theme.colorScheme ===
                                                        "dark"
                                                            ? "rgba(240, 140, 0, 0.2)"
                                                            : "#FFF5E5 !important",
                                                    ".mantine-Alert-message": {
                                                        color:
                                                            theme.colorScheme ===
                                                            "dark"
                                                                ? theme.colors
                                                                      .yellow[5]
                                                                : "#FF9700 !important",
                                                    },
                                                }}
                                                icon={
                                                    <IconAlertCircle
                                                        size={20}
                                                    />
                                                }
                                            >
                                                {item?.comment}
                                            </Alert>
                                        )}
                                        {!item?.is_verified && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: 6,
                                                    right: 10,
                                                }}
                                            >
                                                <ActionIcon
                                                    color="blue"
                                                    onClick={() => {
                                                        setEditKycDocumentOpened(
                                                            true
                                                        );
                                                        setDocumentID(item?.id);
                                                    }}
                                                >
                                                    <IconPencil size={20} />
                                                </ActionIcon>
                                            </Box>
                                        )}
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </>
                        );
                    })}
                </Accordion>
                <Box
                    mt={12}
                    sx={{
                        display: "inline-flex",
                        cursor: "pointer",
                    }}
                    onClick={() => setAddDocumentOpened(true)}
                >
                    <IconCirclePlus size={20} color="gray" />
                    <Text component="p" ml={4}>
                        Add new document
                    </Text>
                </Box>
            </Box>
            <EditKycForm
                opened={editKycOpened}
                setEditKycOpened={setEditKycOpened}
                KycData={KycData}
            />
            <EditKycDocumentForm
                opened={editKycDocumentOpened}
                setEditKycDocumentOpened={setEditKycDocumentOpened}
                id={documentID}
            />
            <AddNewDocumentForm
                opened={addDocumentOpened}
                setAddDocumentOpened={setAddDocumentOpened}
            />
        </>
    );
};
