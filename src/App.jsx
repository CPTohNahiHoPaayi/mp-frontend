import { useState } from "react";
import {
  Flex,
  Box,
  Stack,
  IconButton,
  HStack,
  Button,
  Text,
} from "@chakra-ui/react";
import {
  GoSidebarExpand,
  GoSidebarCollapse,
} from "react-icons/go";
import { BookOpen, Home, StickyNote, Brain, Users, LogOut } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import MyCourseList from "./components/sidebar/MyCourseList";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";

function NavLink({ icon: Icon, label, path, active, onClick }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      color={active ? "whiteAlpha.900" : "whiteAlpha.400"}
      bg="transparent"
      _hover={{ color: "whiteAlpha.800" }}
      onClick={onClick}
      rounded="lg"
      px={3}
      h={9}
      fontWeight={active ? "500" : "400"}
      fontSize="sm"
      transition="all 0.15s ease"
      position="relative"
      _after={active ? {
        content: '""',
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '16px',
        height: '2px',
        bg: '#00C9A7',
        borderRadius: 'full',
      } : {}}
    >
      <Icon size={15} />
      <Text ml={2} display={{ base: "none", md: "block" }}>{label}</Text>
    </Button>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { courseId } = useParams();
  const location = useLocation();

  const { isLoading, isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [refreshCourses, setRefreshCourses] = useState(false);
  const [meta, setMeta] = useState(null);
  const triggerRefresh = () => setRefreshCourses((prev) => !prev);

  if (isLoading) {
    return (
      <Flex align="center" justify="center" h="100vh" bg="#06080F" color="white">
        <Text color="gray.500">Restoring session...</Text>
      </Flex>
    );
  }

  const navItems = [
    { icon: BookOpen, label: "Courses", path: "/" },
    { icon: StickyNote, label: "Notes", path: "/notes" },
    { icon: Brain, label: "Ask Notes", path: "/notes/rag" },
    { icon: Users, label: "Social", path: "/social" },
  ];

  return isAuthenticated() ? (
    <Flex minH="100dvh" overflowX="hidden" bg="#06080F">
      {/* Sidebar */}
      {sidebarOpen && (
        <Box
          bg="#0A0C14"
          w="300px"
          minW="300px"
          maxW="300px"
          h="100dvh"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          borderRight="1px solid"
          borderColor="whiteAlpha.50"
        >
          <Flex align="center" justify="space-between" px={4} py={3}>
            <HStack gap={2}>
              <Box
                w={7}
                h={7}
                rounded="lg"
                bg="linear-gradient(135deg, #00C9A7, #3B82F6)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <BookOpen size={14} color="white" />
              </Box>
              <Text fontSize="sm" fontWeight="bold" color="white">
                Text<Box as="span" color="#00C9A7">ToLearn</Box>
              </Text>
            </HStack>
            <Tooltip content="Close sidebar" positioning={{ placement: "right-end" }} showArrow>
              <IconButton
                aria-label="Close sidebar"
                size="sm"
                variant="ghost"
                color="gray.500"
                _hover={{ color: "white", bg: "whiteAlpha.50" }}
                onClick={() => setSidebarOpen(false)}
              >
                <GoSidebarExpand />
              </IconButton>
            </Tooltip>
          </Flex>
          <Box flex="1" overflowY="auto" px={2}>
            <MyCourseList email={user?.email} refreshTrigger={refreshCourses} />
          </Box>
          {/* Quick links */}
          <Box px={3} pb={3} borderTop="1px solid" borderColor="whiteAlpha.50" pt={3}>
            <Button
              w="full"
              size="sm"
              variant="ghost"
              color="gray.500"
              _hover={{ color: 'white', bg: 'whiteAlpha.50' }}
              rounded="lg"
              justifyContent="flex-start"
              onClick={() => navigate('/notes')}
              h={8}
              fontSize="xs"
            >
              View all notes
            </Button>
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box flex="1" h="100dvh" overflow="hidden" display="flex" flexDirection="column">
        {/* Top Nav */}
        <Box
          as="nav"
          bg="rgba(6,8,15,0.8)"
          backdropFilter="blur(12px)"
          borderBottom="1px solid"
          borderColor="whiteAlpha.50"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          h="52px"
          flexShrink={0}
          px={4}
        >
          {/* Left */}
          <HStack gap={2}>
            {!sidebarOpen && (
              <Tooltip content="Open sidebar" positioning={{ placement: "bottom-start" }} showArrow>
                <IconButton
                  aria-label="Open sidebar"
                  size="sm"
                  variant="ghost"
                  color="gray.500"
                  _hover={{ color: "white", bg: "whiteAlpha.50" }}
                  onClick={() => setSidebarOpen(true)}
                >
                  <GoSidebarCollapse />
                </IconButton>
              </Tooltip>
            )}
            {!sidebarOpen && (
              <HStack gap={1} ml={2}>
                <Box
                  w={6}
                  h={6}
                  rounded="md"
                  bg="linear-gradient(135deg, #00C9A7, #3B82F6)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <BookOpen size={12} color="white" />
                </Box>
                <Text fontSize="sm" fontWeight="bold" color="white" display={{ base: "none", sm: "block" }}>
                  Text<Box as="span" color="#00C9A7">ToLearn</Box>
                </Text>
              </HStack>
            )}
          </HStack>

          {/* Center — Nav links */}
          <HStack gap={1}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              />
            ))}
          </HStack>

          {/* Right — User */}
          <HStack gap={3}>
            {user?.picture && (
              <img
                src={user.picture}
                alt="Profile"
                referrerPolicy="no-referrer"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.1)",
                }}
              />
            )}
            <Button
              onClick={logout}
              size="sm"
              variant="ghost"
              color="gray.500"
              _hover={{ color: "red.400", bg: "whiteAlpha.50" }}
              rounded="lg"
              h={8}
              px={2}
            >
              <LogOut size={15} />
              <Text ml={1.5} fontSize="xs" display={{ base: "none", md: "block" }}>Logout</Text>
            </Button>
          </HStack>
        </Box>

        {/* Page Content */}
        <Box flex={1} overflowY="auto" bg="#06080F">
          <Outlet context={{ triggerRefresh, meta, setMeta }} />
        </Box>
      </Box>
    </Flex>
  ) : (
    <LandingPage />
  );
}

export default App;
