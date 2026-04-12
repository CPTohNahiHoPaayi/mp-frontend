import React, { useState, useEffect } from 'react';
import {
  Box, Button, Center, Flex, Grid, Heading, Input, Spinner, Text, Dialog,
} from '@chakra-ui/react';
import { Plus, Search, FileText, Upload, CheckSquare, Square, Brain, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';
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
      if (!plainText.trim()) {
        console.warn('Ingest skipped: note has no extractable text', noteId);
        return;
      }
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
    <Box minH="full" bg="var(--bg-base)" py={10} px={4} color="var(--text-primary)">
      <Box mb={10} maxW="6xl" mx="auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Flex align="center" gap={3} mb={2}>
            <Box w={10} h={10} rounded="xl" bg="rgba(var(--accent-rgb),0.08)" display="flex" alignItems="center" justifyContent="center">
              <StickyNote size={20} color="var(--accent)" />
            </Box>
            <Box>
              <Heading fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700" color="var(--text-primary)" letterSpacing="-0.01em">
                My Notes
              </Heading>
              <Text fontSize="sm" color="var(--text-muted)">
                {notes.length} notes · {folders.length} folders
              </Text>
            </Box>
          </Flex>
        </motion.div>
      </Box>

      <Box maxW="6xl" mx="auto">
        {/* Search + Actions bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
        <Flex
          gap={3}
          align="center"
          mb={6}
          p={3}
          bg="var(--bg-elevated)"
          border="1px solid"
          borderColor="var(--border-subtle)"
          rounded="2xl"
          wrap="wrap"
        >
          {/* Search */}
          <Flex
            flex={1}
            align="center"
            bg="var(--bg-input)"
            rounded="xl"
            px={3}
            py={1}
            minW="200px"
            _focusWithin={{ bg: 'var(--bg-hover)', boxShadow: '0 0 0 1px rgba(var(--accent-rgb),0.15)' }}
            transition="all 0.2s"
          >
            <Search size={14} color="var(--text-dim)" />
            <input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '13px',
                height: '32px',
                width: '100%',
                marginLeft: '8px',
                caretColor: 'var(--accent)',
              }}
            />
          </Flex>

          {/* Divider */}
          <Box w="1px" h={6} bg="var(--border-light)" display={{ base: 'none', md: 'block' }} />

          {/* Selection & Ingest group */}
          <Flex align="center" gap={1.5}>
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleSelectAll}
              color={allSelected ? 'var(--accent)' : 'var(--text-dim)'}
              _hover={{ color: 'var(--text-secondary)', bg: 'var(--bg-input)' }}
              rounded="lg"
              h={8}
              px={2.5}
            >
              {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
              <Text ml={1.5} fontSize="xs">{allSelected ? 'Deselect' : 'Select All'}</Text>
            </Button>

            {selectedNoteIds.size > 0 ? (
              <Button
                size="xs"
                onClick={() => handleBulkIngest([...selectedNoteIds])}
                loading={bulkIngesting}
                bg="rgba(var(--purple-rgb),0.1)"
                color="var(--purple-light)"
                border="1px solid"
                borderColor="rgba(var(--purple-rgb),0.2)"
                _hover={{ bg: 'rgba(var(--purple-rgb),0.18)' }}
                rounded="lg"
                h={8}
                px={3}
              >
                <Upload size={12} />
                <Text ml={1.5} fontSize="xs">Ingest {selectedNoteIds.size}</Text>
              </Button>
            ) : (
              <Button
                size="xs"
                onClick={() => handleBulkIngest(filteredNotes.map((n) => n.id))}
                loading={bulkIngesting}
                variant="ghost"
                color="var(--text-dim)"
                _hover={{ color: 'var(--purple-light)', bg: 'rgba(var(--purple-rgb),0.06)' }}
                rounded="lg"
                h={8}
                px={2.5}
              >
                <Upload size={12} />
                <Text ml={1.5} fontSize="xs">Ingest All</Text>
              </Button>
            )}
          </Flex>

          {/* Divider */}
          <Box w="1px" h={6} bg="var(--border-light)" display={{ base: 'none', md: 'block' }} />

          {/* Actions group */}
          <Flex align="center" gap={2}>
            <Button
              size="sm"
              onClick={() => navigate('/notes/rag')}
              bg="rgba(var(--blue-rgb),0.1)"
              color="var(--blue-light)"
              border="1px solid"
              borderColor="rgba(var(--blue-rgb),0.2)"
              _hover={{ bg: 'rgba(var(--blue-rgb),0.18)', borderColor: 'rgba(var(--blue-rgb),0.35)' }}
              rounded="xl"
              h={9}
              px={4}
              transition="all 0.2s"
            >
              <Brain size={14} />
              <Text ml={2} fontSize="xs" fontWeight="600">Ask Notes</Text>
            </Button>

            <Button
              onClick={handleCreateNote}
              loading={creating}
              bg="linear-gradient(135deg, var(--accent), var(--blue))"
              color="var(--text-primary)"
              _hover={{ opacity: 0.9, transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(var(--accent-rgb),0.25)' }}
              rounded="xl"
              size="sm"
              h={9}
              px={5}
              transition="all 0.2s"
            >
              <Plus size={15} />
              <Text ml={1.5} fontSize="xs" fontWeight="700">New Note</Text>
            </Button>
          </Flex>
        </Flex>
        </motion.div>

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
              bg="var(--bg-elevated)"
              borderRadius="xl"
              border="1px solid"
              borderColor="var(--border-light)"
              p={3}
            >
              <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)" mb={2} textTransform="uppercase" letterSpacing="wider">
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
                <Text fontSize="sm" color="var(--text-secondary)" mb={4}>
                  Showing notes in <Text as="span" color="blue.300" fontWeight="semibold">{selectedFolderName}</Text>
                </Text>
              )}
              {filteredNotes.length === 0 ? (
                <Center py={16} flexDirection="column" gap={4}>
                  <FileText size={48} color="#4a5568" />
                  <Text color="var(--text-muted)" fontSize="lg">
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
                  {filteredNotes.map((note, i) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.35 }}
                      style={{ height: '100%' }}
                    >
                      <NoteCard
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
                    </motion.div>
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
          <Dialog.Content bg="var(--bg-elevated)" color="var(--text-primary)">
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
                bg="var(--bg-input)"
                border="none"
                color="var(--text-primary)"
                _placeholder={{ color: 'var(--text-secondary)' }}
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
