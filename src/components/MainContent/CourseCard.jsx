import { Box, Button, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { FiLock, FiUnlock } from 'react-icons/fi';
import { BookOpen, Heart, ArrowRight } from 'lucide-react';
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

  const truncate = (str, max = 60) =>
    str.length > max ? str.slice(0, max - 1) + '…' : str;

  const createdDate = new Date(...course.createdAt);

  return (
    <Box
      w="100%"
      bg="rgba(255,255,255,0.02)"
      border="1px solid"
      borderColor="whiteAlpha.50"
      borderRadius="xl"
      p={5}
      transition="all 0.2s ease"
      _hover={{
        borderColor: 'whiteAlpha.200',
        bg: 'rgba(255,255,255,0.04)',
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
      }}
      cursor="pointer"
      onClick={() => navigate(`/courses/${course.id}/module/0/lesson/0`)}
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Flex align="start" justify="space-between" mb={3}>
        <Box
          w={10}
          h={10}
          rounded="lg"
          bg="linear-gradient(135deg, rgba(0,201,167,0.15), rgba(59,130,246,0.15))"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <BookOpen size={18} color="#00C9A7" />
        </Box>
        <Button
          size="xs"
          variant="ghost"
          color={isPublic ? '#00C9A7' : 'gray.600'}
          _hover={{ bg: 'whiteAlpha.50' }}
          onClick={(e) => { e.stopPropagation(); toggleVisibility(); }}
          rounded="lg"
          h={7}
          px={2}
        >
          {isPublic ? <FiUnlock size={12} /> : <FiLock size={12} />}
          <Text ml={1} fontSize="xs">{isPublic ? 'Public' : 'Private'}</Text>
        </Button>
      </Flex>

      {/* Title */}
      <Heading fontSize="md" fontWeight="semibold" color="white" mb={1.5} lineHeight="1.4">
        {truncate(course.title)}
      </Heading>

      {/* Meta */}
      <Text fontSize="xs" color="gray.600" mb={3}>
        {course.creator.split('@')[0]} · {format(createdDate, 'dd MMM yyyy')}
      </Text>

      {/* Tags */}
      {course.tags?.length > 0 && (
        <HStack gap={1.5} mb={4} flexWrap="wrap">
          {course.tags.slice(0, 3).map((tag, i) => (
            <Text
              key={i}
              fontSize="xs"
              color="gray.500"
              bg="whiteAlpha.50"
              px={2}
              py={0.5}
              rounded="md"
            >
              {tag}
            </Text>
          ))}
          {course.tags.length > 3 && (
            <Text fontSize="xs" color="gray.600">+{course.tags.length - 3}</Text>
          )}
        </HStack>
      )}

      {/* Footer */}
      <Flex align="center" justify="space-between" mt="auto" pt={2}>
        <HStack gap={1} color="gray.600">
          <Heart size={13} />
          <Text fontSize="xs">{course.likesCount}</Text>
        </HStack>
        <HStack gap={1} color="#00C9A7" fontSize="xs" fontWeight="medium">
          <Text>Start</Text>
          <ArrowRight size={13} />
        </HStack>
      </Flex>
    </Box>
  );
}

export default CourseCard;
