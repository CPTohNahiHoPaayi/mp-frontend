import React from 'react';
import { Box, Flex, Text, IconButton, Spinner } from '@chakra-ui/react';
import { Heart, Trash2, Eye, EyeOff, FileText, Upload, Check, Clock, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ACCENT_COLORS = [
  { border: 'rgba(0,201,167,0.25)', bg: 'rgba(0,201,167,0.06)', icon: '#00C9A7' },
  { border: 'rgba(124,58,237,0.25)', bg: 'rgba(124,58,237,0.06)', icon: '#A78BFA' },
  { border: 'rgba(59,130,246,0.25)', bg: 'rgba(59,130,246,0.06)', icon: '#60A5FA' },
  { border: 'rgba(245,158,11,0.25)', bg: 'rgba(245,158,11,0.06)', icon: '#FBBF24' },
  { border: 'rgba(236,72,153,0.25)', bg: 'rgba(236,72,153,0.06)', icon: '#F472B6' },
  { border: 'rgba(16,185,129,0.25)', bg: 'rgba(16,185,129,0.06)', icon: '#34D399' },
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < (s || '').length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function NoteCard({
  note, onDelete, onToggleVisibility, onLike, user, showActions = true,
  selectable, selected, onSelect, onIngest, ingesting, ingested,
}) {
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
  const accent = ACCENT_COLORS[hashStr(note.title) % ACCENT_COLORS.length];

  const timeAgo = (() => {
    try {
      const date = typeof note.updatedAt === 'string' ? new Date(note.updatedAt) : note.updatedAt;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch { return ''; }
  })();

  // Extract a preview snippet from content (handles HTML string or TipTap JSON)
  const preview = (() => {
    const raw = note.content;
    if (!raw) return '';
    try {
      // TipTap JSON — recursively extract text nodes
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (obj && obj.type === 'doc' && Array.isArray(obj.content)) {
        const texts = [];
        const walk = (node) => {
          if (node.text) texts.push(node.text);
          if (Array.isArray(node.content)) node.content.forEach(walk);
        };
        walk(obj);
        const joined = texts.join(' ').replace(/\s+/g, ' ').trim();
        return joined.length > 100 ? joined.slice(0, 100) + '...' : joined;
      }
    } catch {
      // Not JSON — treat as HTML
    }
    if (typeof raw === 'string') {
      const div = document.createElement('div');
      div.innerHTML = raw;
      const text = (div.textContent || '').replace(/\s+/g, ' ').trim();
      return text.length > 100 ? text.slice(0, 100) + '...' : text;
    }
    return '';
  })();

  return (
    <Box
      bg="rgba(255,255,255,0.02)"
      border="1px solid"
      borderColor={selected ? '#00C9A7' : 'whiteAlpha.50'}
      rounded="2xl"
      overflow="hidden"
      _hover={{ borderColor: selected ? '#00C9A7' : 'whiteAlpha.200', transform: 'translateY(-3px)', boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}
      transition="all 0.25s ease"
      cursor="pointer"
      onClick={() => navigate(`/notes/${note.id}/edit`)}
      h="full"
      display="flex"
      flexDirection="column"
    >
      {/* Top accent bar */}
      <Box h="3px" bg={`linear-gradient(90deg, ${accent.icon}, transparent)`} />

      <Box p={4} flex={1} display="flex" flexDirection="column">
        {/* Header row: icon + title + checkbox */}
        <Flex align="flex-start" gap={3} mb={3}>
          <Box
            w={9}
            h={9}
            rounded="lg"
            bg={accent.bg}
            border="1px solid"
            borderColor={accent.border}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            mt={0.5}
          >
            <FileText size={16} color={accent.icon} />
          </Box>

          <Box flex={1} minW={0}>
            <Text
              fontSize="sm"
              fontWeight="600"
              color="#E2E8F0"
              lineHeight="1.4"
              noOfLines={2}
              mb={0.5}
            >
              {note.title || 'Untitled'}
            </Text>
            <Flex align="center" gap={2}>
              {timeAgo && (
                <Flex align="center" gap={1}>
                  <Clock size={10} color="#4A5568" />
                  <Text fontSize="2xs" color="#4A5568">{timeAgo}</Text>
                </Flex>
              )}
              {note.isPublic != null && (
                <Flex align="center" gap={1}>
                  {note.isPublic ? <Globe size={10} color="#4A5568" /> : <Lock size={10} color="#4A5568" />}
                  <Text fontSize="2xs" color="#4A5568">{note.isPublic ? 'Public' : 'Private'}</Text>
                </Flex>
              )}
            </Flex>
          </Box>

          {selectable && (
            <Box
              onClick={(e) => { e.stopPropagation(); onSelect?.(note.id); }}
              flexShrink={0}
            >
              <Box
                w={5} h={5} rounded="md"
                border="2px solid"
                borderColor={selected ? '#00C9A7' : 'whiteAlpha.200'}
                bg={selected ? 'rgba(0,201,167,0.15)' : 'transparent'}
                display="flex" alignItems="center" justifyContent="center"
                _hover={{ borderColor: selected ? '#00C9A7' : 'whiteAlpha.400' }}
                transition="all 0.15s"
              >
                {selected && <Check size={12} color="#00C9A7" />}
              </Box>
            </Box>
          )}
        </Flex>

        {/* Preview text */}
        {preview && (
          <Text fontSize="xs" color="#4A5568" lineHeight="1.6" noOfLines={2} mb={3} pl={12}>
            {preview}
          </Text>
        )}

        {/* Tags */}
        {tagsArray.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap" mb={3} pl={12}>
            {tagsArray.map((tag, i) => (
              <Box
                key={i}
                px={2}
                py={0.5}
                rounded="md"
                bg="rgba(59,130,246,0.06)"
                border="1px solid"
                borderColor="rgba(59,130,246,0.12)"
              >
                <Text fontSize="2xs" color="#60A5FA" fontWeight="500">{tag.trim()}</Text>
              </Box>
            ))}
          </Flex>
        )}

        {/* Bottom actions */}
        <Flex
          align="center"
          justify="space-between"
          pt={3}
          mt="auto"
          borderTop="1px solid"
          borderColor="whiteAlpha.50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: like + creator */}
          <Flex align="center" gap={2}>
            {onLike && (
              <Flex
                as="button"
                align="center"
                gap={1}
                px={2}
                py={1}
                rounded="md"
                bg={isLiked ? 'rgba(239,68,68,0.08)' : 'transparent'}
                _hover={{ bg: isLiked ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)' }}
                transition="all 0.15s"
                onClick={() => onLike(note.id)}
              >
                <Heart size={12} fill={isLiked ? '#EF4444' : 'none'} stroke={isLiked ? '#EF4444' : '#4A5568'} />
                <Text fontSize="2xs" color={isLiked ? '#EF4444' : '#4A5568'} fontWeight="500">{note.likesCount || 0}</Text>
              </Flex>
            )}
            {note.creator && !isOwner && (
              <Text fontSize="2xs" color="#4A5568">
                by <Text as="span" color="#718096" fontWeight="500">{note.creator}</Text>
              </Text>
            )}
          </Flex>

          {/* Right: actions */}
          <Flex align="center" gap={0.5}>
            {onIngest && isOwner && (
              <IconButton
                aria-label="Ingest"
                size="xs"
                variant="ghost"
                color={ingested ? '#00C9A7' : '#4A5568'}
                _hover={{ color: '#A78BFA', bg: 'rgba(124,58,237,0.06)' }}
                rounded="lg"
                h={7}
                w={7}
                onClick={() => onIngest(note.id)}
                disabled={ingesting}
              >
                {ingesting ? <Spinner size="xs" /> : ingested ? <Check size={13} /> : <Upload size={13} />}
              </IconButton>
            )}
            {showActions && isOwner && onToggleVisibility && (
              <IconButton
                aria-label="Visibility"
                size="xs"
                variant="ghost"
                color="#4A5568"
                _hover={{ color: '#A0AEC0', bg: 'rgba(255,255,255,0.04)' }}
                rounded="lg"
                h={7}
                w={7}
                onClick={() => onToggleVisibility(note.id)}
              >
                {note.isPublic ? <Eye size={13} /> : <EyeOff size={13} />}
              </IconButton>
            )}
            {showActions && isOwner && onDelete && (
              <IconButton
                aria-label="Delete"
                size="xs"
                variant="ghost"
                color="#4A5568"
                _hover={{ color: '#EF4444', bg: 'rgba(239,68,68,0.06)' }}
                rounded="lg"
                h={7}
                w={7}
                onClick={() => onDelete(note.id)}
              >
                <Trash2 size={13} />
              </IconButton>
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
