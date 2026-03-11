import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Text,
  VStack,
  Spinner,
  HStack,
  Icon,
  Link as ChakraLink,
  Badge,
} from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { MdPlayArrow } from 'react-icons/md';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';



function MyCourseList({refreshTrigger}) {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        
        const res = await axios.get(`${baseURL}/api/courses/myCourses`, {
          headers: {
            Authorization: `Bearer ${token}`,
           
          },
        });
        setCourses(Array.isArray(res.data) ? res.data : res.data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [refreshTrigger]);

  return (
    <Box h="full" display="flex" flexDirection="column">
      {/* Sticky Header */}
      <Box
        px={4}
        py={3}
        position="sticky"
        top={0}
        bg="ghost"
        borderBottom="1px solid #2D3748"
        zIndex={10}
      >
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="gray.300"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Your Courses
        </Text>
      </Box>

      {/* Course List */}
      <Box overflowY="auto"  pr={1} py={2}>
        {loading ? (
          <HStack justify="center" py={6}>
            <Spinner size="sm" color="blue.400" />
            <Text fontSize="sm" color="gray.300">
              Loading courses....
            </Text>
          </HStack>
        ) : courses.length === 0 ? (
          <Box py={6}>
            <Text fontSize="sm" color="ghost" textAlign="center" px={4}>
              You haven’t created or been added to any courses yet.
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={2} px={3} pb={4}>
            {courses.map((course) => (
              <Tooltip
                key={course.id}
                content={course.title}
                showArrow
                positioning={{ placement: 'right-end' }}
                bg="ghost"
                color="white"
                fontSize="xs"
              >
                <ChakraLink
                  as={RouterLink}
                  to={`/courses/${course.id}/module/0/lesson/0`}
                  _hover={{
                    textDecoration: 'none',
                    bg: 'blue.400',
                    color: 'white',
                    transform: 'translateX(3px)',
                    boxShadow: 'sm',
                    borderColor: 'blue.300',
                  }}
                  transition="all 0.2s ease"
                  px={4}
                  py={2}
                  borderRadius="lg"               // ✅ More pronounced rounded corners
                  borderWidth="1px"               // ✅ Subtle border
                  borderColor="whiteAlpha.200"    // ✅ Subtle color on dark bg
                  display="flex"
                  alignItems="center"
                  fontSize="md"
                  fontWeight="medium"
                  color="whiteAlpha.900"
                  bg="ghost"
                >
                  {/* Link Text or Content */}


                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    mr={3}
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="0.7rem"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Icon as={MdPlayArrow} boxSize={3} />

                  </Badge>

                  <Box
                    flex="1"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    fontWeight="semibold"
                  >
                    {course.title.length > 40 ? course.title.slice(0, 35) + '…' : course.title}
                  </Box>
                </ChakraLink>
              </Tooltip>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}

export default MyCourseList;
