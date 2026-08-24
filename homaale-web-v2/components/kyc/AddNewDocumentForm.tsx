import { Modal } from "@mantine/core";
import type { Dispatch, SetStateAction } from "react";

import { useGetKYC } from "@/hooks/kyc/useGetKYC";
import { useKycFormStyles } from "@/styles/components/kycForm";

import DocumentForm from "./DocumentForm";

interface Props {
    opened: boolean;
    setAddDocumentOpened: Dispatch<SetStateAction<boolean>>;
}

const AddNewDocumentForm = ({ opened, setAddDocumentOpened }: Props) => {
    const { data: KycData } = useGetKYC();
    const { classes } = useKycFormStyles();

    return (
        <Modal
            opened={opened}
            onClose={() => setAddDocumentOpened(false)}
            centered
            title="Add KYC Document"
            withCloseButton
            closeOnClickOutside={false}
            overlayProps={{
                opacity: 0.55,
                blur: 3,
            }}
            size="lg"
            padding={32}
            radius={8}
        >
            <div className={classes.wrapper}>
                <DocumentForm
                    KycData={KycData}
                    isAddNew={true}
                    setAddDocumentOpened={setAddDocumentOpened}
                />
            </div>
        </Modal>
    );
};
export default AddNewDocumentForm;
