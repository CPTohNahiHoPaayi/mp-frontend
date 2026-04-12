import React, { useState } from 'react';
import { Box, Flex, Text, IconButton, Input, Button } from '@chakra-ui/react';
import { FolderPlus, Files } from 'lucide-react';
import FolderItem from './FolderItem';

export default function FolderTree({
  folders,
  notes,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const rootFolders = folders.filter((f) => f.parentId == null);

  const handleToggleExpand = (folderId) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  return (
    <Box>
      {/* All Notes entry */}
      <Flex
        align="center"
        px={2}
        py={1}
        borderRadius="md"
        bg={selectedFolderId === null ? 'rgba(var(--accent-rgb),0.12)' : 'transparent'}
        _hover={{ bg: selectedFolderId === null ? 'rgba(var(--accent-rgb),0.12)' : 'var(--bg-hover)' }}
        cursor="pointer"
        onClick={() => onSelectFolder(null)}
        mb={1}
      >
        <Files size={16} color="#60a5fa" style={{ marginRight: 6, flexShrink: 0 }} />
        <Text fontSize="sm" color="var(--text-primary)">Root</Text>
      </Flex>

      {/* Root folders */}
      {rootFolders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          allFolders={folders}
          notes={notes}
          selectedFolderId={selectedFolderId}
          expandedFolders={expandedFolders}
          onSelectFolder={onSelectFolder}
          onToggleExpand={handleToggleExpand}
          onCreateFolder={onCreateFolder}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          depth={0}
        />
      ))}

      {/* New root folder button */}
      <Button
        size="xs"
        variant="ghost"
        color="var(--text-secondary)"
        mt={2}
        width="full"
        justifyContent="flex-start"
        onClick={() => onCreateFolder(null)}
      >
        <FolderPlus size={14} style={{ marginRight: 4 }} />
        New Folder
      </Button>
    </Box>
  );
}
