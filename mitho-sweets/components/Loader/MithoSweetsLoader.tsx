
import { Box } from "@mantine/core";
import Image from "next/image";
import React from "react";
import logo from "@/images/logo-bg.png"

const MithoSweetsLoader = () => {
    // const theme = useMantineTheme();

    return (
        <Box pos={"relative"}>
            <Box>
                <svg
                    width="54"
                    height="54"
                    viewBox="0 0 38 38"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke={"red"}
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

                <Image
                    src={logo}
                    height={42}
                    width={42}
                    alt="mithosweets-logo"
                    priority
                    style={{
                        borderRadius: "50%",
                        position: "absolute",
                        top: 6,
                        left: 6,
                    }}
                />
        </Box>
    );
};

export default MithoSweetsLoader;
