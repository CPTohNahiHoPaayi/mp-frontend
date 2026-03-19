import React, { useState, useEffect } from 'react';
import { Box, Button, Center, Flex, Grid, Heading, Input, Spinner, Text } from '@chakra-ui/react';
import { Plus, Search, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import axios from 'axios';

export default function Notes() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const base_url = import.meta.env.VITE_API_URL;

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base_url}/api/notes/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  const handleCreateNote = async () => {
    setCreating(true);
    try {
      const res = await axios.post(
        `${base_url}/api/notes`,
        { title: 'Untitled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/notes/${res.data.id}/edit`);
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await axios.delete(`${base_url}/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleToggleVisibility = async (noteId) => {
    try {
      await axios.patch(
        `${base_url}/api/notes/${noteId}/visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isPublic: !n.isPublic } : n))
      );
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  const filteredNotes = searchQuery.trim()
    ? notes.filter((n) =>
        (n.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  return (
    <Box minH="100vh" bg="gray.900" py={10} px={4} color="white">
      <Center mb={10} flexDirection="column" textAlign="center">
        <Heading
          fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
          mb={4}
          bg="linear-gradient(135deg, #1e3a5f 0%, #2563EB 50%, #7c3aed 100%)"
          bgClip="text"
          fontWeight="extrabold"
        >
          My Notes
        </Heading>
        <Text color="gray.400" fontSize={{ base: 'md', md: 'lg' }} maxW="2xl">
          Create, edit, and organize your notes with a rich block editor.
        </Text>
      </Center>

      <Box maxW="5xl" mx="auto" mb={8}>
        <Flex gap={4} align="center" mb={6}>
          <Flex
            flex={1}
            bg="gray.800"
            border="1px solid"
            borderColor="gray.700"
            borderRadius="xl"
            align="center"
            px={4}
            py={2}
          >
            <Search size={18} color="gray" />
            <Input
              variant="unstyled"
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ml={3}
              color="white"
              _placeholder={{ color: 'gray.500' }}
            />
          </Flex>
          <Button
            colorScheme="blue"
            onClick={handleCreateNote}
            loading={creating}
            size="lg"
          >
            <Plus size={18} />
            <Text ml={2}>New Note</Text>
          </Button>
        </Flex>

        {loading ? (
          <Center py={12}>
            <Spinner size="lg" color="blue.300" />
            <Text ml={4}>Loading notes...</Text>
          </Center>
        ) : filteredNotes.length === 0 ? (
          <Center py={16} flexDirection="column" gap={4}>
            <FileText size={48} color="#4a5568" />
            <Text color="gray.500" fontSize="lg">
              {searchQuery ? 'No notes match your search.' : 'No notes yet. Create your first note!'}
            </Text>
            {!searchQuery && (
              <Button colorScheme="blue" onClick={handleCreateNote} loading={creating}>
                <Plus size={16} />
                <Text ml={2}>Create Note</Text>
              </Button>
            )}
          </Center>
        ) : (
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                user={user}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
