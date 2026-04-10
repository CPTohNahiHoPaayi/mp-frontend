import React, { useState, useEffect } from 'react';
import {
  Box, Button, Center, Flex, Grid, Heading, Input, Spinner, Text, Dialog,
} from '@chakra-ui/react';
import { Plus, Search, FileText, Upload, CheckSquare, Square, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import FolderTree from '../components/notes/FolderTree';
import { tiptapToText } from '../utils/tiptapToText';
import axios from 'axios';

export default function Notes() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_URL;
  const ragUrl = import.meta.env.VITE_RAG_URL;

  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // RAG ingest state
  const [selectedNoteIds, setSelectedNoteIds] = useState(new Set());
  const [ingestingIds, setIngestingIds] = useState(new Set());
  const [ingestedIds, setIngestedIds] = useState(new Set());
  const [bulkIngesting, setBulkIngesting] = useState(false);

  // New folder dialog state
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState(null);
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const openFolderModal = () => setFolderModalOpen(true);
  const closeFolderModal = () => setFolderModalOpen(false);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${base_url}/api/notes/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await axios.get(`${base_url}/api/folders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders(res.data);
    } catch (err) {
      console.error('Failed to fetch folders:', err);
    }
  };

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([fetchNotes(), fetchFolders()]).finally(() => setLoading(false));
    }
  }, [token]);

  const handleCreateNote = async () => {
    setCreating(true);
    try {
      const body = { title: 'Untitled' };
      if (selectedFolderId != null) body.folderId = selectedFolderId;
      const res = await axios.post(`${base_url}/api/notes`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      await axios.patch(`${base_url}/api/notes/${noteId}/visibility`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isPublic: !n.isPublic } : n))
      );
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  // --- RAG Ingest ---
  const handleIngest = async (noteId) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note || !note.content) return;

    setIngestingIds((prev) => new Set(prev).add(noteId));
    try {
      const plainText = tiptapToText(note.content);
      if (!plainText.trim()) return;
      await axios.post(`${ragUrl}/ingest`, {
        content: plainText,
        source: `note-${note.id}`,
        title: note.title || 'Untitled',
        sections: note.tags?.length ? note.tags : undefined,
      });
      setIngestedIds((prev) => new Set(prev).add(noteId));
    } catch (err) {
      console.error('Ingest failed for note', noteId, err);
    } finally {
      setIngestingIds((prev) => {
        const s = new Set(prev);
        s.delete(noteId);
        return s;
      });
    }
  };

  const handleBulkIngest = async (noteIds) => {
    setBulkIngesting(true);
    for (const id of noteIds) {
      await handleIngest(id);
    }
    setBulkIngesting(false);
  };

  const toggleSelect = (noteId) => {
    setSelectedNoteIds((prev) => {
      const s = new Set(prev);
      s.has(noteId) ? s.delete(noteId) : s.add(noteId);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedNoteIds.size === filteredNotes.length) {
      setSelectedNoteIds(new Set());
    } else {
      setSelectedNoteIds(new Set(filteredNotes.map((n) => n.id)));
    }
  };

  // Folder operations
  const handleCreateFolder = (parentId) => {
    setNewFolderParentId(parentId);
    setNewFolderName('');
    openFolderModal();
  };

  const handleCreateFolderSubmit = async () => {
    if (!newFolderName.trim()) return;
    try {
      const body = { name: newFolderName.trim() };
      if (newFolderParentId != null) body.parentId = newFolderParentId;
      const res = await axios.post(`${base_url}/api/folders`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to create folder:', err);
    } finally {
      closeFolderModal();
    }
  };

  const handleRenameFolder = async (folderId, name) => {
    try {
      const res = await axios.put(`${base_url}/api/folders/${folderId}`, { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders((prev) => prev.map((f) => (f.id === folderId ? res.data : f)));
    } catch (err) {
      console.error('Failed to rename folder:', err);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await axios.delete(`${base_url}/api/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      await fetchNotes();
      if (selectedFolderId === folderId) setSelectedFolderId(null);
    } catch (err) {
      console.error('Failed to delete folder:', err);
    }
  };

  // Filter notes by selected folder; null = root only (no folder)
  const visibleNotes = notes.filter((n) =>
    selectedFolderId === null ? n.folderId == null : n.folderId === selectedFolderId
  );

  const filteredNotes = searchQuery.trim()
    ? visibleNotes.filter((n) =>
        (n.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : visibleNotes;

  const selectedFolderName = selectedFolderId != null
    ? folders.find((f) => f.id === selectedFolderId)?.name
    : null;

  const allSelected = filteredNotes.length > 0 && selectedNoteIds.size === filteredNotes.length;

  return (
    <Box minH="100vh" bg="gray.900" py={10} px={4} color="white">
      <Center mb={8} flexDirection="column" textAlign="center">
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

      <Box maxW="6xl" mx="auto">
        {/* Search + Actions bar */}
        <Flex gap={4} align="center" mb={6} wrap="wrap">
          <Flex
            flex={1}
            bg="gray.800"
            border="1px solid"
            borderColor="gray.700"
            borderRadius="xl"
            align="center"
            px={4}
            py={2}
            minW="200px"
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

          {/* Select All toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSelectAll}
            color={allSelected ? 'blue.300' : 'gray.400'}
          >
            {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
            <Text ml={2} fontSize="sm">Select All</Text>
          </Button>

          {/* Ingest Selected */}
          {selectedNoteIds.size > 0 && (
            <Button
              size="sm"
              colorScheme="purple"
              variant="outline"
              onClick={() => handleBulkIngest([...selectedNoteIds])}
              loading={bulkIngesting}
            >
              <Upload size={14} />
              <Text ml={2}>Ingest Selected ({selectedNoteIds.size})</Text>
            </Button>
          )}

          {/* Ingest All */}
          <Button
            size="sm"
            colorScheme="purple"
            variant="outline"
            onClick={() => handleBulkIngest(filteredNotes.map((n) => n.id))}
            loading={bulkIngesting}
          >
            <Upload size={14} />
            <Text ml={2}>Ingest All</Text>
          </Button>

          {/* Ask Notes (RAG) */}
          <Button
            size="sm"
            colorScheme="blue"
            variant="solid"
            onClick={() => navigate('/notes/rag')}
          >
            <Brain size={14} />
            <Text ml={2}>Ask Notes</Text>
          </Button>

          <Button colorScheme="blue" onClick={handleCreateNote} loading={creating} size="lg">
            <Plus size={18} />
            <Text ml={2}>New Note</Text>
          </Button>
        </Flex>

        {loading ? (
          <Center py={12}>
            <Spinner size="lg" color="blue.300" />
            <Text ml={4}>Loading notes...</Text>
          </Center>
        ) : (
          <Flex gap={6} align="flex-start">
            {/* Sidebar: Folder Tree */}
            <Box
              w="220px"
              flexShrink={0}
              bg="gray.800"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.700"
              p={3}
            >
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={2} textTransform="uppercase" letterSpacing="wider">
                Folders
              </Text>
              <FolderTree
                folders={folders}
                notes={notes}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
              />
            </Box>

            {/* Notes Grid */}
            <Box flex={1}>
              {selectedFolderName && (
                <Text fontSize="sm" color="gray.400" mb={4}>
                  Showing notes in <Text as="span" color="blue.300" fontWeight="semibold">{selectedFolderName}</Text>
                </Text>
              )}
              {filteredNotes.length === 0 ? (
                <Center py={16} flexDirection="column" gap={4}>
                  <FileText size={48} color="#4a5568" />
                  <Text color="gray.500" fontSize="lg">
                    {searchQuery ? 'No notes match your search.' : 'No notes here. Create your first note!'}
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
                      selectable
                      selected={selectedNoteIds.has(note.id)}
                      onSelect={toggleSelect}
                      onIngest={handleIngest}
                      ingesting={ingestingIds.has(note.id)}
                      ingested={ingestedIds.has(note.id)}
                    />
                  ))}
                </Grid>
              )}
            </Box>
          </Flex>
        )}
      </Box>

      {/* New Folder Dialog */}
      <Dialog.Root open={isFolderModalOpen} onOpenChange={(e) => !e.open && closeFolderModal()} placement="center">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="gray.800" color="white">
            <Dialog.Header>
              <Dialog.Title>New Folder</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolderSubmit(); }}
                autoFocus
                bg="gray.700"
                border="none"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </Dialog.Body>
            <Dialog.Footer gap={2}>
              <Button variant="ghost" onClick={closeFolderModal}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleCreateFolderSubmit}>Create</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}
