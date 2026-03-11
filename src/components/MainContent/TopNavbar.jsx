import React from "react";
import {
  Box,
  HStack,
  IconButton,
  Button,
  Tooltip,
  Breadcrumb,
} from "@chakra-ui/react";
import { GoSidebarCollapse } from "react-icons/go";
import {BreadcrumbMenuItem} from "./BreadcrumbMenuItem"; // adjust path if needed

const MAX_TITLE_LENGTH = 60;

function TopNavbar({
  sidebarOpen,
  setSidebarOpen,
  meta,
  moduleIndex,
  lessonIndex,
  courseId,
  isAuthenticated,
  user,
  login,
  logout,
  truncate,
}) {
  return (
    <Box
      as="nav"
      bg="bg.muted"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      h="56px"
      flexShrink={0}
    >
      {/* === Left Side of Navbar === */}
      <HStack spacing={4} align="center" w="100%">
        {/* Sidebar Toggle Button (only shown when sidebar is closed) */}
        {!sidebarOpen ? (
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
        ) : (
          <Box /> // Placeholder
        )}

        {/* === Breadcrumb Navigation === */}
        <Box flex={1}>
          <Breadcrumb.Root
            maxW="100%"
            px={6}
            py={4}
            spacing={3}
            separator=">"
            bg="transparent"
            borderBottom="1px solid"
            borderColor="gray.700"
          >
            <Breadcrumb.List alignItems="center" flexWrap="wrap" gap={2} w="full">
              {/* Course Title */}
              <Breadcrumb.Item>
                <Tooltip
                  content={meta?.title}
                  isDisabled={!meta?.title || meta.title.length <= MAX_TITLE_LENGTH}
                >
                  <Breadcrumb.Link
                    color="blue.300"
                    fontWeight="bold"
                    fontSize="xl"
                    isTruncated
                  >
                    {truncate(meta?.title || "Course Title")}
                  </Breadcrumb.Link>
                </Tooltip>
              </Breadcrumb.Item>

              <Breadcrumb.Separator color="gray.500" fontWeight="bold" />

              {/* Module Title Dropdown */}
              <BreadcrumbMenuItem
                label={truncate(meta?.modules?.[moduleIndex]?.title || "Module Title")}
                items={meta?.modules?.map((mod, idx) => ({
                  label: mod.title,
                  value: `/courses/${courseId}/module/${idx}/lesson/0`,
                })) || []}
                tooltip={meta?.modules?.[moduleIndex]?.title}
              />

              <Breadcrumb.Separator color="gray.500" fontWeight="bold" />

              {/* Lesson Title Dropdown */}
              <BreadcrumbMenuItem
                label={truncate(meta?.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.title || "Lesson Title")}
                items={meta?.modules?.[moduleIndex]?.lessons?.map((lesson, j) => ({
                  label: lesson.title,
                  value: `/courses/${courseId}/module/${moduleIndex}/lesson/${j}`,
                })) || []}
                tooltip={meta?.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.title}
                isCurrent
              />
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </Box>
      </HStack>

      {/* === Right Side of Navbar === */}
      <HStack spacing={4} align="center" pr={4}>
        {isAuthenticated ? (
          <>
            {/* User Avatar */}
            <HStack spacing={3}>
              <img
                src={user?.picture}
                alt="Profile"
                referrerPolicy="no-referrer"
                style={{
                  width: '60px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid white',
                  objectFit: 'cover',
                }}
              />
            </HStack>

            {/* Logout Button */}
            <Button onClick={logout} variant="outline" colorScheme="red">
              Logout
            </Button>
          </>
        ) : (
          <>
            {/* Login / Signup Buttons */}
            <Button onClick={login} variant="outline" colorScheme="blue">
              Login
            </Button>
            <Button onClick={login} variant="solid" colorScheme="blue">
              Signup
            </Button>
          </>
        )}
      </HStack>
    </Box>
  );
}

export default TopNavbar;
