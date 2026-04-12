import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Text, VStack, Spinner, HStack, Flex } from '@chakra-ui/react';
import { BookOpen, StickyNote } from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function SidebarSection({ title, icon: Icon, children, count }) {
  return (
    <Box mb={3}>
      <Flex align="center" gap={2} px={4} py={1.5} mb={1}>
        <Icon size={12} color="var(--accent)" />
        <Text fontSize="10px" fontWeight="600" color="var(--text-muted)" textTransform="uppercase" letterSpacing="0.08em">
          {title}
        </Text>
        {count > 0 && (
          <Text fontSize="10px" color="var(--text-dim)" ml="auto">{count}</Text>
        )}
      </Flex>
      {children}
    </Box>
  );
}

function SidebarItem({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <RouterLink to={to} style={{ textDecoration: 'none', display: 'block' }}>
      <Text
        px={4}
        py={1.5}
        fontSize="13px"
        fontWeight={isActive ? '500' : '400'}
        color={isActive ? 'var(--text-primary)' : 'var(--text-secondary)'}
        bg={isActive ? 'rgba(var(--accent-rgb),0.06)' : 'transparent'}
        _hover={{ color: 'var(--text-primary)', bg: 'var(--bg-elevated)' }}
        transition="all 0.15s"
        cursor="pointer"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        borderLeft="2px solid"
        borderColor={isActive ? 'var(--accent)' : 'transparent'}
      >
        {label}
      </Text>
    </RouterLink>
  );
}

function MyCourseList({ refreshTrigger }) {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_URL;

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
        <Spinner size="sm" color="var(--accent)" />
        <Text fontSize="xs" color="var(--text-muted)">Loading...</Text>
      </HStack>
    );
  }

  return (
    <Box py={2}>
      <SidebarSection title="Courses" icon={BookOpen} count={courses.length}>
        {courses.length === 0 ? (
          <Text fontSize="xs" color="var(--text-dim)" px={4} py={2}>No courses yet</Text>
        ) : (
          <VStack align="stretch" gap={0}>
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

      <Box h="1px" bg="var(--border-base)" mx={4} my={3} />

      <SidebarSection title="Recent Notes" icon={StickyNote} count={notes.length}>
        {notes.length === 0 ? (
          <Text fontSize="xs" color="var(--text-dim)" px={4} py={2}>No notes yet</Text>
        ) : (
          <VStack align="stretch" gap={0}>
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
