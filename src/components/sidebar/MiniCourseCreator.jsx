"use client"

import React, { useState } from 'react';
import {
  Box,
  Stack,
  Input,
  Button,
  Spinner,
  Text,
  Heading,
} from '@chakra-ui/react';
import axios from 'axios';
import { toaster } from '@/components/ui/toaster';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';





function MiniCourseCreator({ onCourseGenerated }) {
  const { token } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;
  const handleClick = async () => {
    if (!topic.trim()) {
      toaster.create({
        description: 'Topic is required.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      


      const res = await axios.post(
        `${baseURL}/api/courses/generate`,
        {
          topic
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toaster.create({
        description: 'Course created successfully!',
        type: 'success',
      });

      if (onCourseGenerated) onCourseGenerated();
    } catch (error) {
      toaster.create({
        description: error.response?.data?.message || error.message,
        type: 'error',
      });
      console.error("Course generation error:", error);
    } finally {
      setLoading(false);
      setTopic('');
    }
  };

  return (
    <Box
      mt={4}
      p={4}
      bg="ghost"               // fixed dark background
      borderRadius="lg"
      boxShadow="sm"
      // borderWidth="1px"
      borderColor="gray.700"     // fixed border color
    >
      <Stack spacing={3}>
        <Heading
          as="h4"
          size="lg"
          color="blue.400"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Sparkles size={18} />
          Create Course
        </Heading>

        <Text fontSize="xs" color="gray.400">
          Generate a course by entering a topic
        </Text>

        <Input
          id="topic"
          placeholder="Enter course topic"
          size="sm"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          bg="ghost"
          color="white"
          borderColor="gray.600"
          _placeholder={{ color: 'gray.400' }}
        />

        <Button
          size="sm"
          colorScheme="blue"
          onClick={handleClick}
          isDisabled={loading}
        >
          {loading ? <Spinner size="sm" /> : 'Create'}
        </Button>
      </Stack>
    </Box>
  );
}

export default MiniCourseCreator;
