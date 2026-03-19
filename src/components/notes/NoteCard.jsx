import React from 'react';
import { Box, Flex, Heading, Text, Button, IconButton, Tag } from '@chakra-ui/react';
import { Heart, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function NoteCard({ note, onDelete, onToggleVisibility, onLike, user, showActions = true }) {
  const navigate = useNavigate();
  const tagsArray = Array.isArray(note.tags)
    ? note.tags.filter(Boolean).slice(0, 3)
    : (note.tags || '').split(',').filter(Boolean).slice(0, 3);

  const isOwner = user?.email === note.creator;
  const likedByUsers = note.likedByUsers || note.likedBy || '';
  const likedByList = typeof likedByUsers === 'string'
    ? likedByUsers.split(',').filter(Boolean)
    : Array.isArray(likedByUsers) ? likedByUsers : [];
  const isLiked = note.liked || likedByList.includes(user?.email);

  const timeAgo = (() => {
    try {
      const date = typeof note.updatedAt === 'string'
        ? new Date(note.updatedAt)
        : note.updatedAt;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  })();

  return (
    <Box
      p={5}
      bg="gray.800"
      rounded="xl"
      shadow="md"
      _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => navigate(`/notes/${note.id}/edit`)}
      position="relative"
    >
      <Box
        h="100px"
        bg="linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)"
        rounded="lg"
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={3}
      >
        <FileText size={32} color="white" opacity={0.6} />
      </Box>

      <Heading size="sm" color="white" mb={2} lineClamp={2}>
        {note.title || 'Untitled'}
      </Heading>

      <Flex gap={2} wrap="wrap" mb={3}>
        {tagsArray.map((tag, i) => (
          <Tag.Root key={i} colorPalette="blue" size="sm" variant="solid">
            <Tag.Label>{tag}</Tag.Label>
          </Tag.Root>
        ))}
      </Flex>

      <Flex justify="space-between" align="center">
        <Text fontSize="xs" color="gray.500">
          {timeAgo}
        </Text>
        <Flex gap={2} align="center" onClick={(e) => e.stopPropagation()}>
          {onLike && (
            <Button size="xs" variant="ghost" onClick={() => onLike(note.id)}>
              <Heart size={14} fill={isLiked ? 'red' : 'none'} stroke={isLiked ? 'red' : 'white'} />
              <Text ml={1} fontSize="xs">{note.likesCount || 0}</Text>
            </Button>
          )}
          {showActions && isOwner && (
            <>
              {onToggleVisibility && (
                <IconButton
                  aria-label="Toggle visibility"
                  size="xs"
                  variant="ghost"
                  onClick={() => onToggleVisibility(note.id)}
                >
                  {note.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  aria-label="Delete note"
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => onDelete(note.id)}
                >
                  <Trash2 size={14} />
                </IconButton>
              )}
            </>
          )}
        </Flex>
      </Flex>

      {note.creator && !isOwner && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          By {note.creator}
        </Text>
      )}
    </Box>
  );
}
