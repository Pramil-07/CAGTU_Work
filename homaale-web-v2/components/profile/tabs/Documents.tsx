import { Box, Flex, Group, Text } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import NoDataAlert from "@/components/common/NoDataAlert";
import urls from "@/constants/urls";
import type { UserProfileProps } from "@/types/profile/UserProfileProps";
import { axiosClient } from "@/utils/axiosClient";

const Documents = () => {
    const { data: userDocuments } = useQuery(["user-documents"], async () => {
        try {
            const { data } = await axiosClient.get<
                UserProfileProps["documentData"]
            >(urls.tasker.documents);
            return data;
        } catch (error) {
            if (error instanceof AxiosError) {
                const errors = Object.values(error.response?.data).join("\n");
                throw new Error(errors);
            }
            throw new Error("Something went wrong");
        }
    });

    return (
        <>
            <Group mt={24}>
                {userDocuments && userDocuments?.length > 0 ? (
                    userDocuments.map((document) => (
                        <Box key={document.id}>
                            <a
                                href={document?.file}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Flex
                                    justify={"center"}
                                    sx={{
                                        border: "1px solid #dee2e6",
                                        borderRadius: "4px",
                                        padding: 32,
                                    }}
                                >
                                    <IconPhoto size={64} color="#0693e3" />
                                </Flex>
                            </a>
                            <Text
                                component="h4"
                                mt={6}
                                sx={{ textTransform: "capitalize" }}
                            >
                                {document?.document_type?.name}
                            </Text>
                        </Box>
                    ))
                ) : (
                    <NoDataAlert message="No Documents to show." />
                )}
            </Group>
        </>
    );
};

export default Documents;
