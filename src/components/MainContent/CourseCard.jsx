import { Box, Button, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { FiLock, FiUnlock } from 'react-icons/fi';
import { Heart, ArrowRight } from 'lucide-react';
import { CoursePDFButton } from './LessonPDFExporter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

function CourseCard({ course }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isPublic, setIsPublic] = useState(course.isPublic);

  const toggleVisibility = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/courses/${course.id}/visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsPublic((prev) => !prev);
    } catch (error) {
      console.error('Visibility toggle failed', error);
    }
  };

  const createdDate = new Date(...course.createdAt);

  return (
    <Box
      w="100%"
      h="full"
      bg="rgba(255,255,255,0.02)"
      border="1px solid"
      borderColor="whiteAlpha.50"
      borderRadius="xl"
      p={5}
      transition="all 0.25s ease"
      _hover={{
        borderColor: 'rgba(0,201,167,0.25)',
        bg: 'rgba(255,255,255,0.035)',
        transform: 'translateY(-2px)',
      }}
      cursor="pointer"
      onClick={() => navigate(`/courses/${course.id}/module/0/lesson/0`)}
      display="flex"
      flexDirection="column"
    >
      {/* Top row: visibility badge */}
      <Flex justify="flex-end" mb={3}>
        <Button
          size="xs"
          variant="ghost"
          color={isPublic ? 'rgba(0,201,167,0.6)' : 'whiteAlpha.300'}
          _hover={{ bg: 'whiteAlpha.50' }}
          onClick={(e) => { e.stopPropagation(); toggleVisibility(); }}
          rounded="full"
          h={6}
          px={2}
          fontSize="xs"
        >
          {isPublic ? <FiUnlock size={10} /> : <FiLock size={10} />}
          <Text ml={1}>{isPublic ? 'Public' : 'Private'}</Text>
        </Button>
      </Flex>

      {/* Title */}
      <Heading
        fontSize="md"
        fontWeight="600"
        color="whiteAlpha.900"
        mb={2}
        lineHeight="1.5"
        noOfLines={2}
        minH="3em"
      >
        {course.title}
      </Heading>

      {/* Meta */}
      <Text fontSize="xs" color="whiteAlpha.400" mb={3}>
        {course.creator.split('@')[0]} · {format(createdDate, 'MMM yyyy')}
      </Text>

      {/* Tags — fixed height area */}
      <Box minH="28px" mb={3}>
        {course.tags?.length > 0 && (
          <HStack gap={1.5} flexWrap="wrap">
            {course.tags.slice(0, 3).map((tag, i) => (
              <Text
                key={i}
                fontSize="10px"
                color="rgba(0,201,167,0.7)"
                bg="rgba(0,201,167,0.06)"
                border="1px solid"
                borderColor="rgba(0,201,167,0.1)"
                px={2}
                py={0.5}
                rounded="full"
                lineHeight="1.4"
              >
                {tag}
              </Text>
            ))}
            {course.tags.length > 3 && (
              <Text fontSize="10px" color="whiteAlpha.300">+{course.tags.length - 3}</Text>
            )}
          </HStack>
        )}
      </Box>

      {/* Footer — pinned to bottom */}
      <Flex align="center" justify="space-between" mt="auto" pt={3} borderTop="1px solid" borderColor="whiteAlpha.50">
        <HStack gap={3} color="whiteAlpha.300">
          <HStack gap={1}>
            <Heart size={12} />
            <Text fontSize="xs">{course.likesCount}</Text>
          </HStack>
          <CoursePDFButton courseId={course.id} courseTitle={course.title} />
        </HStack>
        <HStack gap={1} color="rgba(0,201,167,0.6)" fontSize="xs" fontWeight="medium"
          _groupHover={{ color: '#00C9A7' }}
        >
          <Text>Start</Text>
          <ArrowRight size={12} />
        </HStack>
      </Flex>
    </Box>
  );
}

export default CourseCard;
