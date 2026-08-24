import type { GetStaticProps } from "next";
import React, {useEffect, useState} from "react";

import KycForm from "@/components/kyc/KycForm";
import { KYCStatus } from "@/components/kyc/KycStatus";
import urls from "@/constants/urls";
import { useGetKYC } from "@/hooks/kyc/useGetKYC";
import { useGetKYCDocument } from "@/hooks/kyc/useGetKycDocument";
import type { KYCDocumentProps } from "@/types/kyc/KyCDocumentProps";
import type { KYCResponse } from "@/types/kyc/KycResponse";
import { axiosClient } from "@/utils/axiosClient";

import { SkeletonKycStatus } from "../../skeletons/SkeletonKycStatus";

const KYC = ({
    KycStaticData,
    KycDocumentsStaticData,
}: {
    KycStaticData?: KYCResponse;
    KycDocumentsStaticData?: KYCDocumentProps;
}) => {
    const { data: KycData = KycStaticData, isLoading } = useGetKYC();
    const { data: KycDocuments = KycDocumentsStaticData, isLoading: isLoad } =
        useGetKYCDocument();
    const [kycData, setKycData] = useState<KYCResponse | null>(null);
    const [kycDocuments, setKycDocuments] = useState<KYCDocumentProps | null>(null);
    useEffect(() => {
        const fetchKycData = async () => {
            try {
                const { data: KycStaticData } = await axiosClient.get<KYCResponse>(urls.kyc.myKyc);
                const { data: KycDocumentsStaticData } = await axiosClient.get<KYCDocumentProps>(urls.kyc.kycDocument);
                setKycData(KycStaticData);
                setKycDocuments(KycDocumentsStaticData);
            } catch (err: any) {
                console.error('Error fetching KYC data:', err);
                setKycData(null);
                setKycDocuments([]);
            }
        };
        fetchKycData();
    }, []);
    console.log("KycData:", KycData);
    console.log("KycDocuments:", KycDocuments);
    return (
        <>
            {isLoad || isLoading ? (
                <SkeletonKycStatus />
            ) : KycData && KycDocuments?.length ? (
                <KYCStatus KycData={KycData} KycDocuments={KycDocuments} />
            ) : (
                <KycForm KycData={KycData} />
            )}
        </>
    );
};

export default KYC;

// export const getStaticProps: GetStaticProps = async () => {
//     try {
//         const { data: KycStaticData } = await axiosClient.get<KYCResponse>(
//             urls.kyc.myKyc
//         );
//         const { data: KycDocumentsStaticData } =
//             await axiosClient.get<KYCDocumentProps>(urls.kyc.kycDocument);
//
//         return {
//             props: {
//                 KycStaticData,
//                 KycDocumentsStaticData,
//             },
//             revalidate: 10,
//         };
//     } catch (err: any) {
//         return {
//             props: {
//                 KycStaticData: [],
//                 KycDocumentsStaticData: [],
//             },
//             revalidate: 10,
//         };
//     }
// };
