import React, { useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { HelpCircle, X, BookOpen, GraduationCap, StickyNote, Brain, Globe, Lightbulb, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { USAGE_GUIDE } from '@/data/usageGuide';

const ICONS = {
  BookOpen, GraduationCap, StickyNote, Brain, Globe, Lightbulb,
};

function getActiveGuide(pathname) {
  if (pathname.includes('/module/') && pathname.includes('/lesson/')) return 'lesson';
  if (pathname === '/notes/rag') return 'askNotes';
  if (pathname.startsWith('/notes')) return 'notes';
  if (pathname === '/social') return 'social';
  return 'courses';
}

export default function UsageGuide() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const location = useLocation();

  const currentPage = getActiveGuide(location.pathname);

  const handleOpen = () => {
    setActiveTab(currentPage);
    setOpen(true);
  };

  const tabs = Object.entries(USAGE_GUIDE);

  const guide = USAGE_GUIDE[activeTab || currentPage];
  const Icon = ICONS[guide?.icon] || Lightbulb;

  return (
    <Box position="fixed" bottom={6} right={20} zIndex={9999}>
      {!open ? (
        <Box
          as="button"
          onClick={handleOpen}
          w={11}
          h={11}
          rounded="full"
          bg="var(--bg-surface)"
          border="1px solid"
          borderColor="var(--border-light)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{ bg: 'var(--bg-hover)', transform: 'scale(1.08)' }}
          transition="all 0.2s"
          boxShadow="var(--shadow-card)"
        >
          <HelpCircle size={16} color="var(--text-muted)" />
        </Box>
      ) : (
        <Box
          bg="var(--bg-surface)"
          border="1px solid"
          borderColor="var(--border-light)"
          rounded="2xl"
          w="380px"
          maxH="480px"
          boxShadow="var(--shadow-dropdown)"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {/* Header */}
          <Flex
            align="center"
            justify="space-between"
            px={4}
            py={3}
            borderBottom="1px solid"
            borderColor="var(--border-subtle)"
            flexShrink={0}
          >
            <Flex align="center" gap={2}>
              <HelpCircle size={16} color="var(--accent)" />
              <Text fontSize="sm" fontWeight="600" color="var(--text-primary)">
                Usage Guide
              </Text>
            </Flex>
            <Box
              as="button"
              onClick={() => setOpen(false)}
              color="var(--text-dim)"
              _hover={{ color: 'var(--text-secondary)' }}
              p={1}
            >
              <X size={14} />
            </Box>
          </Flex>

          {/* Tab bar */}
          <Flex
            px={3}
            py={2}
            gap={1}
            overflowX="auto"
            borderBottom="1px solid"
            borderColor="var(--border-subtle)"
            flexShrink={0}
            css={{ '&::-webkit-scrollbar': { display: 'none' } }}
          >
            {tabs.map(([key, val]) => {
              const TabIcon = ICONS[val.icon] || Lightbulb;
              const isActive = (activeTab || currentPage) === key;
              return (
                <Flex
                  key={key}
                  as="button"
                  align="center"
                  gap={1.5}
                  px={2.5}
                  py={1.5}
                  rounded="lg"
                  bg={isActive ? 'rgba(var(--accent-rgb),0.1)' : 'transparent'}
                  color={isActive ? 'var(--accent)' : 'var(--text-dim)'}
                  _hover={{ bg: isActive ? undefined : 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                  transition="all 0.15s"
                  onClick={() => setActiveTab(key)}
                  flexShrink={0}
                  fontSize="xs"
                  fontWeight={isActive ? '600' : '400'}
                >
                  <TabIcon size={12} />
                  <Text whiteSpace="nowrap">{val.title}</Text>
                </Flex>
              );
            })}
          </Flex>

          {/* Tips list */}
          <Box flex={1} overflowY="auto" px={4} py={3}>
            <Flex align="center" gap={2} mb={3}>
              <Icon size={16} color="var(--accent)" />
              <Text fontSize="sm" fontWeight="600" color="var(--text-primary)">
                {guide?.title}
              </Text>
            </Flex>

            <Flex direction="column" gap={2}>
              {guide?.tips.map((tip, i) => (
                <Flex key={i} gap={2.5} align="flex-start">
                  <Box mt={1.5} flexShrink={0}>
                    <ChevronRight size={10} color="var(--accent)" />
                  </Box>
                  <Text fontSize="xs" color="var(--text-body)" lineHeight="1.7">
                    {tip}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>

          {/* Footer */}
          <Box px={4} py={2} borderTop="1px solid" borderColor="var(--border-subtle)" flexShrink={0}>
            <Text fontSize="2xs" color="var(--text-dim)" textAlign="center">
              Tips update based on the page you're on
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
