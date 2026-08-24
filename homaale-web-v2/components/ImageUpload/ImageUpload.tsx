import type { Dispatch, SetStateAction } from "react";
import { forwardRef } from "react";

import { useProfile } from "@/hooks/useProfile";
import type { AvatarProps } from "@/types/AvatarProps";

import PhotoEdit from "./PhotoEdit";

// import useProfileStore from "store/use-profile-store";
// import type { AvatarProps } from "types/avatarProps";

interface ImageUploadProps {
    name: string;
    // ref: React.RefObject<HTMLInputElement>;
    photo: any;
    setShowEditForm: Dispatch<SetStateAction<boolean>>;
    setIsEditButtonClicked: Dispatch<SetStateAction<boolean>>;
    showEditForm: boolean;
    handleClose: () => void;
    onChange: (e: any) => void;
    isEditButtonClicked?: boolean;
    userId?: string;
    display: boolean;
    onPhotoEdit: (url: RequestInfo | URL, file: File) => void;
    onAvatarEdit: (avatar: AvatarProps[0]) => void;
    setFieldValue: (key: string, data: number | File | undefined) => void;
    setPreviewImage?: any;
}

// eslint-disable-next-line react/display-name
export const ImageUpload = forwardRef<HTMLInputElement, ImageUploadProps>(
    (props, ref) => {
        const {
            onChange,
            setIsEditButtonClicked,
            photo,
            setShowEditForm,
            showEditForm,
            handleClose,
            onAvatarEdit,
            userId,
            isEditButtonClicked,
            setFieldValue,
            onPhotoEdit,
            setPreviewImage,
        } = props;

        const { data: profile } = useProfile();

        const profileImage = profile?.profile_image;

        return (
            <>
                <span
                    hidden
                    ref={ref}
                    onChange={onChange}
                    onClick={() => setShowEditForm(true)}
                />
                <PhotoEdit
                    setIsEditButtonClicked={setIsEditButtonClicked}
                    opened={showEditForm}
                    userId={userId}
                    setShowEditForm={setShowEditForm}
                    handleClose={handleClose}
                    isEditButtonClicked={isEditButtonClicked}
                    onPhotoEdit={onPhotoEdit}
                    onAvatarEdit={onAvatarEdit}
                    haveImage={profileImage ? true : false}
                    photo={profileImage ? profileImage : photo}
                    setFieldValue={setFieldValue}
                    setPreviewImage={setPreviewImage}
                />
            </>
        );
    }
);
