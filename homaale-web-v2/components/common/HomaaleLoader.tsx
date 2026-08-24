import { useBrandData } from "@/brand/BrandContext";
import { useBrand } from "@/hooks/useBrand";
import { Box, useMantineTheme } from "@mantine/core";
import Image from "next/image";
import React from "react";

const HomaaleLoader = () => {
    const theme = useMantineTheme();
    const brand= useBrand()
    const {brandData}= useBrandData()
    return (
        <Box pos={"relative"}>
            <Box>
                <svg
                    width="54"
                    height="54"
                    viewBox="0 0 38 38"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke={theme.colors.brand[4]}
                >
                    <g fill="none" fillRule="evenodd">
                        <g transform="translate(1 1)" strokeWidth="2">
                            <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
                            <path d="M36 18c0-9.94-8.06-18-18-18">
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 18 18"
                                    to="360 18 18"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </path>
                        </g>
                    </g>
                </svg>
            </Box>
          {brand==="cagtu"?
             <Image
             src="/images/logo/cagtu-logo.svg"
             height={20}
             width={48}
             alt="serviceprovider-image"
             priority
             style={{
                 borderRadius: "0%",
                 position: "absolute",
                 top: 8,
                 left: 2,
             }}
         />  
         :
            <Image
                src="/images/logo/homaale-favicon.png"
                height={42}
                width={42}
                alt="serviceprovider-image"
                priority
                style={{
                    borderRadius: "50%",
                    position: "absolute",
                    top: 6,
                    left: 6,
                }}
            />}
        </Box>
    );
};

export default HomaaleLoader;
