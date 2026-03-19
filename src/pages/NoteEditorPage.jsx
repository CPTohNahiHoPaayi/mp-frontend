import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, Input, Button, Text, Spinner, Center, IconButton, Tag } from '@chakra-ui/react';
import { ArrowLeft, Sparkles, Eye, EyeOff, Check } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NoteEditor from '../components/notes/NoteEditor';
import axios from 'axios';

export default function NoteEditorPage() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const base_url = import.meta.env.VITE_API_URL;

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const titleRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get(`${base_url}/api/notes/${noteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNote(res.data);
        setTitle(res.data.title || 'Untitled');
        setTags(Array.isArray(res.data.tags) ? res.data.tags : []);
      } catch (err) {
        console.error('Failed to fetch note:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && noteId) fetchNote();
  }, [token, noteId]);

  const saveNote = async (updates) => {
    setSaving(true);
    try {
      await axios.put(
        `${base_url}/api/notes/${noteId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleContentUpdate = (contentJson) => {
    saveNote({ content: contentJson });
  };

  const handleTitleBlur = () => {
    if (title !== note?.title) {
      saveNote({ title });
      setNote((prev) => ({ ...prev, title }));
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        saveNote({ tags: newTags });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    saveNote({ tags: newTags });
  };

  const handleToggleVisibility = async () => {
    try {
      await axios.patch(
        `${base_url}/api/notes/${noteId}/visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNote((prev) => ({ ...prev, isPublic: !prev.isPublic }));
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  const handleEnhanceWithAI = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    setEnhancing(true);
    try {
      const html = editor.getHTML();
      const res = await axios.post(
        `${base_url}/api/notes/${noteId}/enhance`,
        { html, title },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const enhancedHtml = res.data?.html;
      if (enhancedHtml) {
        editor.commands.setContent(enhancedHtml, false);
      }
    } catch (err) {
      console.error('Failed to enhance note:', err);
    } finally {
      setEnhancing(false);
    }
  };

  if (loading) {
    return (
      <Center h="80vh">
        <Spinner size="lg" color="blue.300" />
        <Text ml={4} color="white">Loading note...</Text>
      </Center>
    );
  }

  if (!note) {
    return (
      <Center h="80vh" flexDirection="column" gap={4}>
        <Text color="gray.400" fontSize="lg">Note not found.</Text>
        <Button onClick={() => navigate('/notes')} colorScheme="blue">
          Back to Notes
        </Button>
      </Center>
    );
  }

  return (
    <Box h="calc(100dvh - 56px)" display="flex" flexDirection="column" bg="gray.900" color="white">
      {/* Top bar */}
      <Flex
        px={4}
        py={2}
        bg="gray.800"
        borderBottom="1px solid"
        borderColor="gray.700"
        align="center"
        justify="space-between"
        flexShrink={0}
      >
        <Flex align="center" gap={3}>
          <IconButton
            aria-label="Back"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/notes')}
          >
            <ArrowLeft size={18} />
          </IconButton>
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            variant="unstyled"
            fontSize="xl"
            fontWeight="bold"
            color="white"
            placeholder="Untitled"
            _placeholder={{ color: 'gray.500' }}
            maxW="400px"
          />
        </Flex>

        <Flex align="center" gap={3}>
          {lastSaved && (
            <Flex align="center" gap={1}>
              <Check size={12} color="#68d391" />
              <Text fontSize="xs" color="gray.500">Saved</Text>
            </Flex>
          )}
          {saving && <Text fontSize="xs" color="gray.500">Saving...</Text>}
          <Button
            size="sm"
            variant="solid"
            colorScheme="purple"
            onClick={handleEnhanceWithAI}
            loading={enhancing}
          >
            <Sparkles size={16} />
            <Text ml={2}>Enhance</Text>
          </Button>
          <IconButton
            aria-label="Toggle visibility"
            variant="ghost"
            size="sm"
            onClick={handleToggleVisibility}
          >
            {note.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
          </IconButton>
        </Flex>
      </Flex>

      {/* Tags bar */}
      <Flex px={6} py={2} gap={2} wrap="wrap" align="center" bg="gray.850" flexShrink={0}>
        {tags.map((tag, i) => (
          <Tag.Root key={i} colorPalette="blue" size="sm" variant="solid" cursor="pointer" onClick={() => handleRemoveTag(tag)}>
            <Tag.Label>{tag} ×</Tag.Label>
          </Tag.Root>
        ))}
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tag..."
          variant="unstyled"
          fontSize="sm"
          color="gray.400"
          _placeholder={{ color: 'gray.600' }}
          w="120px"
        />
      </Flex>

      {/* Editor */}
      <Box flex={1} overflow="auto" px={{ base: 2, md: 8 }} py={4}>
        <Box maxW="4xl" mx="auto" h="100%">
          <NoteEditor content={note.content} onUpdate={handleContentUpdate} editorRef={editorRef} />
        </Box>
      </Box>
    </Box>
  );
}
