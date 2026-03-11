import { Box, Button, Heading, HStack, Stack, Tag, Text, Tooltip } from '@chakra-ui/react';
import { FiLock, FiUnlock } from 'react-icons/fi';
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

  const truncate = (str, max = 70) =>
    str.length > max ? str.slice(0, max - 1) + '…' : str;

  const createdDate = new Date(...course.createdAt);

  return (
    <Box
      w="100%"
      maxW="320px"
      bg="black"
      border="1px solid"
      borderColor="whiteAlpha.300"
      borderRadius="lg"
      p={5}
      m={3}
      boxShadow="md"
      transition="all 0.2s ease"
      _hover={{
        boxShadow: 'lg',
        transform: 'translateY(-3px)',
      }}
    >
      <Heading fontSize="lg" mb={1} color="blue.300" noOfLines={2}>
        {truncate(course.title)}
      </Heading>

      <Text fontSize="sm" color="gray.400" noOfLines={1}>
        by {course.creator.split('@')[0]}
      </Text>

      <Text fontSize="xs" color="gray.500" mt={1}>
        {format(createdDate, 'dd MMM yyyy, hh:mm a')}
      </Text>

      <Box
        mt={3}
        mb={3}
        height="1px"
        bg="whiteAlpha.200"
        borderRadius="full"
      />

      {course.tags?.length > 0 && (
       <HStack wrap="wrap" spacing={1} mb={3} flexWrap="wrap">
       {course.tags.slice(0, 3).map((tag, i) => (
         <Tag.Root
           key={i}
           colorPalette="blue"
           size="sm"
           variant="solid"
           borderRadius="full"
         >
           <Tag.Label>{tag}</Tag.Label>
         </Tag.Root>
       ))}
     
       {course.tags.length > 3 && (
         <Tag.Root colorPalette="blue" size="sm" variant="outline" borderRadius="full">
           <Tag.Label>+{course.tags.length - 3}</Tag.Label>
         </Tag.Root>
       )}
     </HStack>
     
      )}

      <Stack spacing={2} mt="auto">
        <Button
          size="sm"
          colorScheme="blue"
          onClick={() => navigate(`/courses/${course.id}/module/0/lesson/0`)}
        >
          Start Course
        </Button>

        {/* <Tooltip
          label={isPublic ? 'Visible to everyone' : 'Only visible to you'}
          hasArrow
        > */}
          <Button
            size="xs"
            variant="ghost"
       
            onClick={toggleVisibility}
            colorScheme={isPublic ? 'green' : 'gray'}
          >
             {isPublic ? <FiUnlock /> : <FiLock />}
            {isPublic ? 'Public' : 'Private'}
          </Button>
        {/* </Tooltip> */}

        <Text fontSize="xs" color="gray.500" textAlign="right">
          {course.likesCount} Likes
        </Text>
      </Stack>
    </Box>
  );
}

export default CourseCard;
