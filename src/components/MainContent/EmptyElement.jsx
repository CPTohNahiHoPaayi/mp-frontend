'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  HStack,
  IconButton,
  Stack,
  Input,
  Button,
  Spinner,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import { format } from 'date-fns';

import { Sparkles, BookOpen, CalendarDays, Layers, User } from 'lucide-react';
import { toaster } from '@/components/ui/toaster';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CourseCard from './CourseCard';

function MiniCourseCreator({ onCourseGenerated }) {
  const { token } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;
  const handleClick = async () => {
    if (!topic.trim()) {
      toaster.create({ description: 'Topic is required.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {

      await axios.post(
        `${baseURL}/api/courses/generate`,
        { topic },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toaster.create({ description: 'Course created successfully!', type: 'success' });
      if (onCourseGenerated) onCourseGenerated();
    } catch (error) {
      toaster.create({
        description: error.response?.data?.message || error.message,
        type: 'error',
      });
      console.error('Course generation error:', error);
    } finally {
      setLoading(false);
      setTopic('');
    }
  };

  return (
    <Box
      mt={6}
      p={2}
      border="1px solid"
      borderColor="gray.600"
      borderRadius="full"
      bg="gray.800"
      w="100%"
      maxW="600px"
      mx="auto"
    >
      <HStack spacing={2}>
        <Input
          variant="unstyled"
          bg="gray.800"
          placeholder="Create any course..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          color="white"
          _placeholder={{ color: 'gray.400' }}
        />
        <IconButton
          onClick={handleClick}

          colorScheme="blue"
          aria-label="Create"
          isDisabled={loading}
          size="sm"
          rounded="full"
        >
          {loading ? <Spinner size="sm" /> : <Send size={18} />}
        </IconButton>
      </HStack>
    </Box>
  );
}

function EmptyElement() {
  const baseURL = import.meta.env.VITE_API_URL;
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  // console.log(baseURL);
  const fetchCourses = async () => {
    try {

      const res = await axios.get(`${baseURL}/api/courses/myCourses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(Array.isArray(res.data) ? res.data : res.data.courses || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const userName = user?.name || user?.nickname || user?.email?.split('@')[0];

  return (
    <Box h="full" px={{ base: 4, md: 8 }} py={10}>
      <Box maxW="7xl" mx="auto">
        <VStack spacing={6} textAlign="center" mb={10}>
          <Heading fontSize={{ base: '3xl', md: '4xl' }} fontWeight="extrabold">
            Welcome{userName ? `, ${userName}` : ''} to{' '}
            <Text as="span" color="blue.400">TextToLearn</Text>
          </Heading>
  
          <Text fontSize="md" color="gray.400" maxW="600px">
            Create your own AI-generated course in seconds and start learning smarter.
          </Text>
        </VStack>
  
        <MiniCourseCreator onCourseGenerated={fetchCourses} />
  
        <Box mt={10}>
          {loading ? (
            <VStack py={6}>
              <Spinner size="md" color="blue.300" />
              <Text fontSize="sm" color="gray.400">Loading courses...</Text>
            </VStack>
          ) : courses.length === 0 ? (
            <Text fontSize="md" color="gray.500" textAlign="center" mt={6}>
              You haven’t created or been added to any courses yet.
            </Text>
          ) : (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={6}
              mt={4}
            >
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Box>
    </Box>
  );
  
}

export default EmptyElement;
