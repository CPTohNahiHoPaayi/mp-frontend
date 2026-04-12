import { Box, Button, Center, Flex, Heading, Text } from '@chakra-ui/react';
import { Tag } from '@chakra-ui/react'; // Assuming you're using the new Tag.Root format
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CourseCard = ({ course, user, handleLike }) => {
  const navigate = useNavigate();

  const tagsArray = (course.tags || '')
    .split(',')
    .filter(Boolean)
    .slice(0, 2);

  const likedBy = (course.likedBy || '').split(',').map(s => s.trim());
  const isLiked = user && likedBy.includes(user.email);

  return (
    <Box
      p={4}
      bg="var(--bg-surface)"
      rounded="xl"
      shadow="md"
      _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
      transition="all 0.2s"
    >
      <Box
        h="150px"
        bgGradient="linear(to-br, blue.500, pink.500)"
        rounded="lg"
        position="relative"
      >
        <Center position="absolute" inset={0} bg="var(--bg-overlay)">
          <Heading size="md" color="var(--text-primary)" textAlign="center">
            {course.title}
          </Heading>
        </Center>
      </Box>

      <Flex justify="space-between" align="center" mt={4}>
        <Text fontSize="sm" color="var(--text-secondary)">
          By {course.creator || 'Anonymous'}
        </Text>

        <Flex gap={2} wrap="wrap">
          {tagsArray.map((tag, i) => (
            <Tag.Root
              key={i}
              colorPalette="blue"
              size="sm"
              variant="solid"
              className="mr-2 mb-2"
            >
              <Tag.Label>{tag}</Tag.Label>
            </Tag.Root>
          ))}
        </Flex>
      </Flex>

      <Flex justify="space-between" align="center" mt={4}>
        <Flex gap={3} align="center">
          <Button
            size="sm"
            variant="ghost"
            colorScheme={isLiked ? 'red' : 'gray'}
            onClick={() => handleLike(course.id)}
          >
            <Heart size={16} fill={isLiked ? 'red' : 'none'} />
            <Text ml={2}>{course.likesCount}</Text>
          </Button>
        </Flex>

        <Button
          colorScheme="blue"
          size="sm"
          onClick={() =>
            navigate(`/courses/${course.id}/module/0/lesson/0`)
          }
        >
          View Course
        </Button>
      </Flex>
    </Box>
  );
};
