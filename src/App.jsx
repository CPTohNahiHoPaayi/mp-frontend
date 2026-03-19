import { useState } from "react";
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
import { Tooltip } from "@/components/ui/tooltip";
import MyCourseList from "./components/sidebar/MyCourseList";
import MiniCourseCreator from "./components/sidebar/MiniCourseCreator";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { BreadcrumbMenuItem } from "./components/MainContent/BreadcrumbMenuItem";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
// import { useNavigate } from "react-router-dom";
import Sidebar from "./components/MainContent/Sidebar"
import RightCourseDrawer from "./components/MainContent/RightCourseDrawer";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { courseId, moduleIndex = 0, lessonIndex = 0 } = useParams();
  const [meta, setMeta] = useState(null);
  const MAX_TITLE_LENGTH = 25;

  const {
    isLoading,
    isAuthenticated,
    login,
    logout,
    user,
  } = useAuth();
  const navigate = useNavigate();
  const [refreshCourses, setRefreshCourses] = useState(false);
  const triggerRefresh = () => setRefreshCourses((prev) => !prev);

  const truncate = (text) =>
    text?.length > MAX_TITLE_LENGTH ? text.slice(0, MAX_TITLE_LENGTH) + "…" : text;

  if (isLoading) {
    return (
      <Flex align="center" justify="center" h="100vh" bg="gray.900" color="white">
        <Text>Restoring session...</Text>
      </Flex>
    );
  }

  return isAuthenticated() ? (
    <Flex minH="100dvh" overflowX="hidden">
      {/* Sidebar with fixed width */}
      {sidebarOpen && (
        <Box
          bg="black"
          w="280px"
          minW="400px"
          maxW="400px"
          h="100dvh"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <Tooltip content="Close sidebar" positioning={{ placement: "right-end" }} showArrow>
            <IconButton
              aria-label="Close sidebar"
              size="lg"
              variant="ghost"
              onClick={() => setSidebarOpen(false)}
            >
              <GoSidebarExpand />
              Text To Learn
            </IconButton>
          </Tooltip>
          <Box flex="1" overflowY="auto">
            <MyCourseList email={user?.email} refreshTrigger={refreshCourses} />
          </Box>
          <Box mt={4} px={2}>
            <MiniCourseCreator onCourseGenerated={triggerRefresh} />
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box flex="1" h="100dvh" overflow="hidden">
        <Stack h="full">
          {/* Navigation Bar */}
          <Box
            as="nav"
            bg="bg.muted"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            h="56px"
            flexShrink={0}
            px={4}
          >
            <HStack spacing={4} align="center" w="100%" justify={"space-between"}>
              {!sidebarOpen ? (
                <Box>
                  <Tooltip content="Open sidebar" positioning={{ placement: "bottom-start" }} showArrow>
                    <IconButton
                      aria-label="Open sidebar"
                      size="lg"
                      variant="ghost"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <GoSidebarCollapse />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Box w="48px" /> // Keeps layout consistent when sidebar is open
              )}

<Box >
  {/* Navigation Links */}
  <Button
    variant="ghost"
    colorScheme="blue"
    size="lg"
    onClick={() => navigate("/")}
    _hover={{ bg: "blue.100", transform: "translateY(-2px)", boxShadow: "md", color:"black" }}
    _active={{ bg: "blue.200", transform: "translateY(0px)" }}
    transition="all 0.2s ease-in-out"
  >
    Home
  </Button>

  <Button
    variant="ghost"
    colorScheme="blue"
    size="lg"
    onClick={() => navigate("/notes")}
    _hover={{ bg: "blue.100", transform: "translateY(-2px)", boxShadow: "md" ,color:"black"}}
    _active={{ bg: "blue.200", transform: "translateY(0px)" }}
    transition="all 0.2s ease-in-out"
  >
    Notes
  </Button>

  <Button
    variant="ghost"
    colorScheme="blue"
    size="lg"
    onClick={() => navigate("/social")}
    _hover={{ bg: "blue.100", transform: "translateY(-2px)", boxShadow: "md" ,color:"black"}}
    _active={{ bg: "blue.200", transform: "translateY(0px)" }}
    transition="all 0.2s ease-in-out"
  >
    Social
  </Button>
</Box>

              <Box>
                <HStack>
                <img
                  src={user?.picture}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid white'
                  }}
                />
                <Button onClick={logout} variant="outline" colorScheme="red">
                  Logout
                </Button>
                </HStack>
              </Box>
            </HStack>
          </Box>

          {/* Main Page Content */}
          <Box flex={1} overflowY="auto" bg="bg.muted">
            <Box w="100%">
              <Outlet context={{ meta, setMeta }} />
            </Box>
          </Box>
        </Stack>
      </Box>
    </Flex>
  ) : (
    <LandingPage />
  );
}

export default App;
