// import { Box, Flex } from "@mantine/core";
// import parse from "html-react-parser";
//
// import { usefaqQuestionStyles } from "@/styles/components/FAQquestionStyles";
// import type { FAQValueProps } from "@/types/FaqsProps";
//
// export const FaqsQuestions = ({
//     faqs,
// }: {
//     faqs: FAQValueProps["result"][0];
// }) => {
//     const { classes } = usefaqQuestionStyles();
//     const { content, title } = faqs ?? ({} as FAQValueProps["result"][0]);
//     return (
//         <Box className={classes.root}>
//             <Flex gap={10} justify={"flex-start"} align={"flex-start"} mt={22}>
//                 <div className="content_wrapper">
//                     <h4>{title}</h4>
//                     {content && <p>{parse(content)}</p>}
//                 </div>
//             </Flex>
//         </Box>
//     );
// };

               // ...................Changed code ...................

import { useEffect,useState } from "react";

import { usefaqQuestionStyles } from "@/styles/components/FAQquestionStyles";
import type { FAQValueProps } from "@/types/FaqsProps";

export const FaqsQuestions = ({
                                  faqs,
                              }: {
    faqs: FAQValueProps["result"][0];
}) => {
    const [MantineComponents, setMantineComponents] = useState<{ Box: any; Flex: any } | null>(null);
    const [parse, setParse] = useState<any>(null);

    // Use the style hook at the top level
    const { classes } = usefaqQuestionStyles();

    useEffect(() => {
        // Load Mantine components dynamically
        import("@mantine/core").then(({ Box, Flex }) => {
            setMantineComponents({ Box, Flex });
        });

        // Load html-react-parser dynamically
        import("html-react-parser").then((module) => {
            setParse(() => module.default);
        });
    }, []);

    const { content, title } = faqs ?? ({} as FAQValueProps["result"][0]);

    if (!MantineComponents || !parse) {
        return null; // Optionally, you can add a loader here
    }

    const { Box, Flex } = MantineComponents;

    return (
        <Box className={classes.root}>
            <Flex gap={10} justify={"flex-start"} align={"flex-start"} mt={22}>
                <div className="content_wrapper">
                    <h4>{title}</h4>
                    {content && <p>{parse(content)}</p>}
                </div>
            </Flex>
        </Box>
    );
};

