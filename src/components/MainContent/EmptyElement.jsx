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
  Flex,
} from '@chakra-ui/react';
import { Sparkles, Send, BookOpen, Zap } from 'lucide-react';
import { toaster } from '@/components/ui/toaster';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import CourseCard from './CourseCard';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

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
    } finally {
      setLoading(false);
      setTopic('');
    }
  };

  return (
    <Flex
      maxW="560px"
      mx="auto"
      align="center"
      gap={3}
      bg="rgba(255,255,255,0.03)"
      border="1px solid"
      borderColor="whiteAlpha.50"
      rounded="full"
      pl={5}
      pr={1.5}
      py={1.5}
      _focusWithin={{ borderColor: '#00C9A7', boxShadow: '0 0 0 1px rgba(0,201,167,0.2)' }}
      transition="all 0.2s ease"
    >
      <Sparkles size={16} color="#555" style={{ flexShrink: 0 }} />
      <Input
        variant="unstyled"
        placeholder="What do you want to learn?"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
        color="white"
        _placeholder={{ color: '#555' }}
        h={9}
        fontSize="sm"
      />
      <IconButton
        onClick={handleClick}
        aria-label="Create course"
        disabled={loading}
        size="sm"
        rounded="full"
        bg={topic.trim() ? 'linear-gradient(135deg, #00C9A7, #3B82F6)' : 'whiteAlpha.50'}
        color={topic.trim() ? 'white' : 'gray.600'}
        _hover={{ opacity: 0.85 }}
        transition="all 0.15s ease"
        w={8}
        h={8}
        minW={8}
      >
        {loading ? <Spinner size="xs" /> : <Send size={14} />}
      </IconButton>
    </Flex>
  );
}

function EmptyElement() {
  const baseURL = import.meta.env.VITE_API_URL;
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <Box minH="full" px={{ base: 4, md: 8 }} py={10} position="relative">
      {/* Subtle background glow */}
      <Box
        position="absolute"
        top="-20%"
        left="50%"
        transform="translateX(-50%)"
        w="600px"
        h="400px"
        borderRadius="50%"
        bg="rgba(0,201,167,0.04)"
        filter="blur(100px)"
        pointerEvents="none"
      />

      <Box maxW="7xl" mx="auto" position="relative" zIndex={1}>
        {/* Hero greeting */}
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={stagger}
          textAlign="center"
          mb={10}
        >
          <MotionBox variants={fadeUp} custom={0}>
            <Text fontSize="sm" color="gray.600" mb={2}>
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
            </Text>
          </MotionBox>

          <MotionBox variants={fadeUp} custom={1}>
            <Heading
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="800"
              color="white"
              letterSpacing="-0.02em"
            >
              {userName ? `Welcome back, ${userName}` : 'Welcome to '}
              {!userName && (
                <Text as="span" color="#00C9A7">TextToLearn</Text>
              )}
            </Heading>
          </MotionBox>

          <MotionBox variants={fadeUp} custom={2}>
            <Text fontSize="md" color="gray.500" mt={3} maxW="500px" mx="auto">
              Create AI-powered courses in seconds. Just type a topic below.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* Course creator */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          mb={12}
        >
          <MiniCourseCreator onCourseGenerated={fetchCourses} />
        </MotionBox>

        {/* Courses section */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {courses.length > 0 && (
            <Flex align="center" gap={2} mb={6}>
              <BookOpen size={18} color="#00C9A7" />
              <Text fontSize="lg" fontWeight="semibold" color="white">
                Your Courses
              </Text>
              <Text fontSize="sm" color="gray.600">
                ({courses.length})
              </Text>
            </Flex>
          )}

          {loading ? (
            <VStack py={12}>
              <Spinner size="md" color="#00C9A7" />
              <Text fontSize="sm" color="gray.600">Loading courses...</Text>
            </VStack>
          ) : courses.length === 0 ? (
            <VStack py={16} gap={4}>
              <Box
                w={16}
                h={16}
                rounded="2xl"
                bg="rgba(0,201,167,0.08)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Zap size={28} color="#00C9A7" />
              </Box>
              <Text fontSize="md" color="gray.500" textAlign="center">
                No courses yet. Create your first one above!
              </Text>
            </VStack>
          ) : (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              gap={5}
            >
              {courses.map((course, i) => (
                <MotionBox
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <CourseCard course={course} />
                </MotionBox>
              ))}
            </SimpleGrid>
          )}
        </MotionBox>
      </Box>
    </Box>
  );
}

export default EmptyElement;
