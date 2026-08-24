import {
    Button,
    Flex,
    Group,
    Loader,
    LoadingOverlay,
    Modal,
    Text,
} from "@mantine/core";
import { IconCircleX } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";

import { useDelete } from "@/hooks/useDelete";

import HomaaleLoader from "./HomaaleLoader";
import { toast } from "./Toast";

interface DeleteModalProps {
    show: boolean;
    handleClose: () => void;
    setShowDeleteModal: Dispatch<SetStateAction<boolean>>;
    id?: number;
    modalName?: string;
    invalidateKey?: string;
}

const DeleteModal = ({
    show,
    handleClose,
    id,
    setShowDeleteModal,
    modalName,
    invalidateKey,
}: DeleteModalProps) => {
    const queryClient = useQueryClient();

    const { mutate, isLoading } = useDelete(`/tasker/${modalName}/${id}/`);

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Modal
                opened={show}
                onClose={handleClose}
                centered
                withCloseButton={false}
                closeOnClickOutside={false}
                overlayProps={{
                    opacity: 0.55,
                    blur: 3,
                }}
                size="md"
                className="delete-modal"
                padding={24}
            >
                <Flex align={"center"} justify={"center"} direction={"column"}>
                    <div className="icon-block">
                        <IconCircleX size={48} color="red" />
                    </div>
                    <Text
                        sx={{
                            fontSize: 24,
                            fontWeight: 400,
                            marginBottom: 16,
                        }}
                    >
                        Are you sure?
                    </Text>
                    <Text
                        component="p"
                        sx={{
                            textAlign: "center",
                            color: "gray",
                        }}
                        mb={36}
                    >
                        Do you really want to delete this record? This process
                        cannot be undone.
                    </Text>
                    <Group>
                        <Button
                            color={"gray.5"}
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color={"red.6"}
                            disabled={isLoading}
                            onClick={() => {
                                mutate(id, {
                                    onSuccess: async () => {
                                        setShowDeleteModal(false);
                                        toast.success(
                                            `${modalName} detail deleted successfully`
                                        );
                                        queryClient.invalidateQueries([
                                            invalidateKey,
                                        ]);
                                    },
                                    onError: (error: any) => {
                                        toast.error(error.message);
                                    },
                                });
                            }}
                        >
                            {isLoading ? (
                                <Loader variant="dots" size={"sm"} />
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </Group>
                </Flex>
            </Modal>
        </>
    );
};
export default DeleteModal;
