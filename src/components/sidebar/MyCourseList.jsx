import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Text,
  VStack,
  Spinner,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { BookOpen, StickyNote, ChevronRight } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function SidebarSection({ title, icon: Icon, children, count }) {
  return (
    <Box mb={4}>
      <Flex align="center" gap={2} px={3} py={2}>
        <Icon size={13} color="#00C9A7" />
        <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
          {title}
        </Text>
        {count > 0 && (
          <Text fontSize="xs" color="gray.700" ml="auto">{count}</Text>
        )}
      </Flex>
      {children}
    </Box>
  );
}

function SidebarItem({ to, label, active }) {
  return (
    <RouterLink to={to} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        px={3}
        py={1.5}
        mx={1}
        rounded="lg"
        color={active ? 'white' : 'gray.400'}
        bg={active ? 'whiteAlpha.100' : 'transparent'}
        _hover={{ bg: 'whiteAlpha.50', color: 'white' }}
        transition="all 0.15s ease"
        cursor="pointer"
        gap={2}
      >
        <Text
          flex={1}
          fontSize="sm"
          fontWeight="medium"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {label}
        </Text>
        <ChevronRight size={12} style={{ opacity: 0.3, flexShrink: 0 }} />
      </Flex>
    </RouterLink>
  );
}

function MyCourseList({ refreshTrigger }) {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, notesRes] = await Promise.all([
          axios.get(`${baseURL}/api/courses/myCourses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseURL}/api/notes/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data.courses || []);
        setNotes(Array.isArray(notesRes.data) ? notesRes.data.slice(0, 10) : []);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, token]);

  if (loading) {
    return (
      <HStack justify="center" py={8}>
        <Spinner size="sm" color="#00C9A7" />
        <Text fontSize="xs" color="gray.600">Loading...</Text>
      </HStack>
    );
  }

  return (
    <Box py={2}>
      {/* Courses */}
      <SidebarSection title="Courses" icon={BookOpen} count={courses.length}>
        {courses.length === 0 ? (
          <Text fontSize="xs" color="gray.700" px={3} py={2}>
            No courses yet
          </Text>
        ) : (
          <VStack align="stretch" gap={0.5}>
            {courses.map((course) => (
              <SidebarItem
                key={course.id}
                to={`/courses/${course.id}/module/0/lesson/0`}
                label={course.title}
              />
            ))}
          </VStack>
        )}
      </SidebarSection>

      {/* Divider */}
      <Box h="1px" bg="whiteAlpha.50" mx={3} my={2} />

      {/* Recent Notes */}
      <SidebarSection title="Recent Notes" icon={StickyNote} count={notes.length}>
        {notes.length === 0 ? (
          <Text fontSize="xs" color="gray.700" px={3} py={2}>
            No notes yet
          </Text>
        ) : (
          <VStack align="stretch" gap={0.5}>
            {notes.map((note) => (
              <SidebarItem
                key={note.id}
                to={`/notes/${note.id}/edit`}
                label={note.title || 'Untitled'}
              />
            ))}
          </VStack>
        )}
      </SidebarSection>
    </Box>
  );
}

export default MyCourseList;
