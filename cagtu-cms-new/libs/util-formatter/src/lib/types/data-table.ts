import { CSSProperties, ReactNode } from 'react';

export interface DataTableProps {
    data: any[];
    columns?: any[];
    page?: number;
    checked?: string[];
    isLoading?: boolean;
    isSuccess?: boolean;
    total: number;
    isDeleteModalOpened?: boolean;
    isRejectModalOpened?: boolean;
    isMultiDeleteModalOpened?: boolean;
    isSingleDeleteMutationLoading?: boolean;
    isSingleRejectMutationLoading?: boolean;
    isMultiDeleteMutationLoading?: boolean;
    isAllCheckboxSelected?: any;
    isCheckboxSelect?: (id: number | string) => boolean;
    handleSelect?: (id: number | string) => void;
    onSelectAll?: () => void;
    onSetPage?: (page: number) => void;
    onClickDeleteAll?: () => void;
    onConfirmSingleDelete?: () => void;
    onConfirmSingleReject?: () => void;
    onConfirmMultiDelete?: () => void;
    handleSingleDeleteCloseModal?: () => void;
    handleSingleRejectCloseModal?: () => void;
    handleMultiDeleteCloseModal?: () => void;
    isCheckbox?: boolean;
    withPaginaton?: boolean;
    limitChange?: string;
    handleLimitChange?: (value: string) => void;
    isInterminate?: boolean;
}
export interface TreeDataTableProps {
    data: any[];
    columns?: any[];
    page?: number;
    checked?: string[];
    isLoading?: boolean;
    isSuccess?: boolean;
    total: number;
    isDeleteModalOpened?: boolean;
    isMultiDeleteModalOpened?: boolean;
    isSingleDeleteMutationLoading?: boolean;
    isMultiDeleteMutationLoading?: boolean;
    isAllCheckboxSelected?: any;
    isCheckboxSelect?: (id: number) => boolean;
    handleSelect?: (id: number) => void;
    onSelectAll?: () => void;
    onSetPage?: (page: number) => void;
    onClickDeleteAll?: () => void;
    onConfirmSingleDelete?: () => void;
    onConfirmMultiDelete?: () => void;
    handleSingleDeleteCloseModal?: () => void;
    handleMultiDeleteCloseModal?: () => void;
    handleLimitChange?: (value: string) => void;
    limitChange?: string;
    isInterminate?: boolean;
    isCheckbox?: boolean;
}

export interface TableColumnsProps {
    path: string;
    label: ReactNode;
    content?: any;
    style?: CSSProperties;
}
