import React from "react";
import { useDark } from "@/utils/helpers";
import {ShareButton} from "@/components/common/ShareButton";
import merchant from "@/pages/merchant/profile";
import ShareModal from "@/components/common/ShareModal";
import Ellipsis from "@/components/common/Ellipsis";
import {useProfile} from "@/hooks/useProfile";
import BreadCrumb from "@/components/common/BreadCrumb";

const Header= ({ merchantId , name , image}: {  merchantId: any , name: string | undefined , image:string | undefined}) => {
    const dark = useDark();
    const {data: profileData} = useProfile();
    const permission = profileData?.user?.id === merchantId;
    // console.log("hearder",name)
    return (
        <header className="flex flex-col justify-between px-4 w-full mx-auto mt-8">
            {/* Main Header Section */}
            <div className="flex flex-wrap justify-between w-full gap-5 items-center">
                <h1 className="text-[28px] text-[#000000] font-normal" style={{color: dark ? "white" : ""}}>
                    Profile
                </h1>
                <div className="flex gap-4 items-center">
                    {/*update button is commented for future use */}
                    {/*<button*/}
                    {/*    type="button"*/}
                    {/*    className="px-6 py-2 text-white bg-[#FF9500] rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"*/}
                    {/*    aria-label="Update profile"*/}
                    {/*>*/}
                    {/*    Update*/}
                    {/*</button>*/}

                    {/*previous share button */}
                    {/*<button*/}
                    {/*    type="button"*/}
                    {/*    className="w-10 h-10 flex items-center justify-center text-neutral-700 rounded border border-solid border-black/10 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"*/}
                    {/*    style={{background: dark? "#797979": ""}}*/}
                    {/*>*/}
                    {/*    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                    {/*        <path*/}
                    {/*            d="M5.9375 6.6875H16.5625L11.5625 2.39062C11.1719 1.97396 11.1458 1.53125 11.4844 1.0625C11.901 0.671875 12.3438 0.645833 12.8125 0.984375L19.6875 6.88281C19.8698 7.09115 19.974 7.33854 20 7.625C20 7.91146 19.8958 8.14583 19.6875 8.32812L12.8125 14.2266C12.6302 14.3828 12.4219 14.4609 12.1875 14.4609C11.901 14.4609 11.6667 14.3568 11.4844 14.1484C11.1458 13.6797 11.1719 13.237 11.5625 12.8203L16.5625 8.52344H5.9375C4.79167 8.54948 3.82812 8.95312 3.04688 9.73438C2.29167 10.4896 1.90104 11.4271 1.875 12.5469V17.1953C1.82292 17.8724 1.51042 18.224 0.9375 18.25C0.364583 18.1979 0.0520833 17.8854 0 17.3125V12.6641C0.0520833 10.9714 0.638021 9.5651 1.75781 8.44531C2.85156 7.32552 4.24479 6.73958 5.9375 6.6875Z"*/}
                    {/*            fill={dark ? "White" :"#343A40"}/>*/}
                    {/*    </svg>*/}
                    {/*</button>*/}
                    {/*<ShareButton*/}
                    {/*    style={{background:"red"}}*/}
                    {/*    showText*/}
                    {/*    url={`${window.location.origin}/merchant/`}*/}
                    {/*/>*/}
                    <ShareButton
                        showText
                        url={`${window.location.origin}/merchant/${merchantId}`}
                    />
                    {!permission &&(
                        <Ellipsis
                            size={16}
                            type="merchant"
                            id={merchantId}
                            reportHeading={name ? `Report ${name}` : "Merchant"}
                            reportSubHeading="Please provide details about the issue with this merchant."
                            reportedUserId={merchantId}
                            reportedUserName={name || "Merchant"}
                            reportedUserImage={image || ""}
                        />
                    )}
                </div>
            </div>

            {/* Breadcrumb Section */}
            {/* <nav className="flex gap-2 items-center mt-2" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                    <li>
                        <a
                            href="/"
                            className="text-sm text-[#6B7280] hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 rounded"
                        >
                            Home
                        </a>
                    </li>
                    <li className="flex items-center gap-2">
                        <span
                            className="text-sm text-[#1F1F1F]"
                            aria-hidden="true"
                            style={{color: dark ? "#797979" : ""}}
                        >
                            &gt;
                        </span>
                        <span className="text-sm text-[#1F1F1F]" style={{color: dark ? "#797979" : ""}}>Profile</span>
                    </li>
                </ol>
            </nav> */}
            <BreadCrumb currentTitle={"Profile"} items={[{name:"Merchant Dashboard", href:""}]}/>
        </header>
    );
};

export default Header;
