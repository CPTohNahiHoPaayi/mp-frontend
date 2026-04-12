import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, Button, Text, Spinner, Center, IconButton } from '@chakra-ui/react';
import { ArrowLeft, Sparkles, Eye, EyeOff, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NoteEditor from '../components/notes/NoteEditor';
import { sanitizeEnhancedNoteHtml } from '../utils/enhanceNoteHtml';
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

  // Auto-resize title textarea when note loads
  useEffect(() => {
    if (titleRef.current && title && !loading) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [title, loading]);

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

  const handleTitleInput = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
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
        editor.commands.setContent(sanitizeEnhancedNoteHtml(enhancedHtml), false);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ minHeight: 'calc(100dvh - 56px)', display: 'flex', flexDirection: 'column' }}>
    <Box flex="1" display="flex" flexDirection="column" bg="#06080F" color="white">
      {/* Top bar — navigation + actions only, sticky below App nav */}
      <Flex
        px={4}
        py={3}
        bg="#06080F"
        borderBottom="1px solid"
        borderColor="#1C2030"
        align="center"
        justify="space-between"
        flexShrink={0}
        position="sticky"
        top={0}
        zIndex={11}
      >
        <Flex align="center" gap={2}>
          <IconButton
            aria-label="Back to Notes"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/notes')}
          >
            <ArrowLeft size={18} />
          </IconButton>
          <Text fontSize="sm" color="gray.500" userSelect="none">Notes</Text>
        </Flex>

        <Flex align="center" gap={3}>
          {lastSaved && !saving && (
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
            aria-label={note.isPublic ? 'Make private' : 'Make public'}
            variant="ghost"
            size="sm"
            onClick={handleToggleVisibility}
            title={note.isPublic ? 'Public — click to make private' : 'Private — click to make public'}
          >
            {note.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
          </IconButton>
        </Flex>
      </Flex>

      {/* Document content area */}
      <Box flex={1} bg="#06080F">
        <Box maxW="4xl" mx="auto" px={{ base: 4, md: 12 }} pt={10} pb={4}>

          {/* Document title */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            onInput={handleTitleInput}
            placeholder="Untitled"
            rows={1}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#E2E8F0',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.25,
              resize: 'none',
              overflow: 'hidden',
              width: '100%',
              marginBottom: '12px',
              caretColor: '#00C9A7',
              fontFamily: 'inherit',
            }}
          />

          {/* Tags metadata row */}
          <Flex
            gap={2}
            wrap="wrap"
            align="center"
            pb={4}
            mb={6}
            borderBottom="1px solid"
            borderColor="#1C2030"
          >
            {tags.map((tag, i) => (
              <Text
                key={i}
                as="span"
                fontSize="xs"
                color="#8BB8A8"
                bg="rgba(0,201,167,0.08)"
                border="1px solid"
                borderColor="rgba(0,201,167,0.15)"
                px={2}
                py={0.5}
                rounded="full"
                cursor="pointer"
                onClick={() => handleRemoveTag(tag)}
                title="Click to remove"
                _hover={{ borderColor: 'rgba(0,201,167,0.4)' }}
                transition="all 0.15s"
              >
                {tag} ×
              </Text>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#A0AEC0',
                fontSize: '13px',
                width: '100px',
                caretColor: '#00C9A7',
              }}
            />
          </Flex>

          {/* Rich text editor */}
          <NoteEditor content={note.content} onUpdate={handleContentUpdate} editorRef={editorRef} />

        </Box>
      </Box>
    </Box>
    </motion.div>
  );
}
