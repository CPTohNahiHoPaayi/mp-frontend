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
import { Home, StickyNote, Brain, Users, LogOut, BookOpen } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import MyCourseList from "./components/sidebar/MyCourseList";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import ThemePicker from "./components/ui/ThemePicker";
import UsageGuide from "./components/ui/UsageGuide";

function NavLink({ icon: Icon, label, path, active, onClick }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      color={active ? "var(--accent)" : "var(--text-muted)"}
      bg="transparent"
      _hover={{ color: active ? "var(--accent)" : "var(--text-secondary)" }}
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
        bg: 'var(--accent)',
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
      <Flex align="center" justify="center" h="100vh" bg="var(--bg-base)" color="var(--text-primary)">
        <Text color="var(--text-muted)">Restoring session...</Text>
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
    <Flex minH="100dvh" overflowX="hidden" bg="var(--bg-base)">
      {/* Sidebar */}
      {sidebarOpen && (
        <Box
          bg="var(--bg-surface)"
          w="300px"
          minW="300px"
          maxW="300px"
          h="100dvh"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          borderRight="1px solid"
          borderColor="var(--border-base)"
        >
          <Flex align="center" justify="space-between" px={4} py={3}>
            <HStack gap={2}>
              <Box
                w={7}
                h={7}
                rounded="lg"
                bg="linear-gradient(135deg, var(--accent), var(--blue))"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Brain size={14} color="var(--text-primary)" />
              </Box>
              <Text fontSize="sm" fontWeight="bold" color="var(--text-primary)">
                Mind<Box as="span" color="var(--accent)">Palace</Box>
              </Text>
            </HStack>
            <Tooltip content="Close sidebar" positioning={{ placement: "right-end" }} showArrow>
              <IconButton
                aria-label="Close sidebar"
                size="sm"
                variant="ghost"
                color="var(--text-muted)"
                _hover={{ color: "white", bg: "var(--bg-elevated)" }}
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
          <Box px={3} pb={3} borderTop="1px solid" borderColor="var(--border-base)" pt={3}>
            <Button
              w="full"
              size="sm"
              variant="ghost"
              color="var(--text-muted)"
              _hover={{ color: 'var(--text-primary)', bg: 'var(--bg-hover)' }}
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
          bg="var(--bg-nav)"
          backdropFilter="blur(12px)"
          borderBottom="1px solid"
          borderColor="var(--border-base)"
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
                  color="var(--text-muted)"
                  _hover={{ color: "white", bg: "var(--bg-elevated)" }}
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
                  bg="linear-gradient(135deg, var(--accent), var(--blue))"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Brain size={12} color="var(--text-primary)" />
                </Box>
                <Text fontSize="sm" fontWeight="bold" color="var(--text-primary)" display={{ base: "none", sm: "block" }}>
                  Mind<Box as="span" color="var(--accent)">Palace</Box>
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
                  border: "2px solid var(--border-light)",
                }}
              />
            )}
            <Button
              onClick={logout}
              size="sm"
              variant="ghost"
              color="var(--text-muted)"
              _hover={{ color: "red.400", bg: "var(--bg-elevated)" }}
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
        <Box flex={1} overflowY="auto" bg="var(--bg-base)">
          <Outlet context={{ triggerRefresh, meta, setMeta }} />
        </Box>
      </Box>
      <UsageGuide />
      <ThemePicker />
    </Flex>
  ) : (
    <LandingPage />
  );
}

export default App;
