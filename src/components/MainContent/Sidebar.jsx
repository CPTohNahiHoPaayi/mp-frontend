import React from 'react'
import {
    Flex,
    Box,
    Stack,
    IconButton,
    HStack,
    Breadcrumb,
    Button,
    Text,
    useBreakpointValue,
} from "@chakra-ui/react";
import {
    GoSidebarExpand,
    GoSidebarCollapse,
} from "react-icons/go";
import { Tooltip } from "../ui/tooltip";
import MyCourseList from "../sidebar/MyCourseList";
import MiniCourseCreator from "../sidebar/MiniCourseCreator";
function Sidebar({ sidebarOpen, refreshCourses, email ,setSidebarOpen,triggerRefresh}) {

    if (sidebarOpen) {
        return(
        <Box bg="ghost" w="350px" h="100dvh" display="flex" flexDirection="column" minW={"350px"}>
            <Box>
                <Tooltip content="Close sidebar" positioning={{ placement: "right-end" }} showArrow>
                    <IconButton
                        aria-label="Close sidebar"
                        size="lg"
                        variant="ghost"
                        onClick={() => setSidebarOpen(false)}

                    >
                        <GoSidebarExpand />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box flex="1" overflowY="auto">
                <MyCourseList email={email} refreshTrigger={refreshCourses} />
            </Box>
            <Box mt={4}>
                <MiniCourseCreator onCourseGenerated={triggerRefresh} />
            </Box>
        </Box>
        )
    } else {
        return (<></>)
    }

}

export default Sidebar;