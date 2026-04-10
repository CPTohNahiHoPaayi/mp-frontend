import React, { useState } from 'react';
import { Box, Flex, Text, IconButton, Input } from '@chakra-ui/react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export default function FolderItem({
  folder,
  allFolders,
  notes,
  selectedFolderId,
  expandedFolders,
  onSelectFolder,
  onToggleExpand,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  depth = 0,
}) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.name);

  const children = allFolders.filter((f) => f.parentId === folder.id);
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolderId === folder.id;
  const hasChildren = children.length > 0;

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      onRenameFolder(folder.id, renameValue.trim());
    }
    setRenaming(false);
  };

  return (
    <Box>
      <Flex
        align="center"
        px={2}
        py={1}
        pl={`${8 + depth * 16}px`}
        borderRadius="md"
        bg={isSelected ? 'blue.800' : 'transparent'}
        _hover={{ bg: isSelected ? 'blue.800' : 'gray.700' }}
        cursor="pointer"
        onClick={() => onSelectFolder(folder.id)}
        role="group"
      >
        {/* Expand/collapse toggle */}
        <Box
          as="span"
          mr={1}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleExpand(folder.id);
          }}
          opacity={hasChildren ? 1 : 0}
          cursor={hasChildren ? 'pointer' : 'default'}
        >
          {isExpanded ? <ChevronDown size={14} color="#9ca3af" /> : <ChevronRight size={14} color="#9ca3af" />}
        </Box>

        {isExpanded ? (
          <FolderOpen size={16} color="#60a5fa" style={{ marginRight: 6, flexShrink: 0 }} />
        ) : (
          <Folder size={16} color="#60a5fa" style={{ marginRight: 6, flexShrink: 0 }} />
        )}

        {renaming ? (
          <Flex flex={1} align="center" gap={1} onClick={(e) => e.stopPropagation()}>
            <Input
              size="xs"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') setRenaming(false);
              }}
              autoFocus
              bg="gray.600"
              color="white"
              border="none"
              px={1}
            />
            <IconButton size="xs" variant="ghost" onClick={handleRenameSubmit} aria-label="Confirm rename">
              <Check size={12} />
            </IconButton>
            <IconButton size="xs" variant="ghost" onClick={() => setRenaming(false)} aria-label="Cancel rename">
              <X size={12} />
            </IconButton>
          </Flex>
        ) : (
          <Text fontSize="sm" color="gray.200" flex={1} isTruncated>
            {folder.name}
          </Text>
        )}

        {/* Action buttons — visible on hover */}
        {!renaming && (
          <Flex
            gap={0}
            opacity={0}
            _groupHover={{ opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="New subfolder"
              onClick={() => onCreateFolder(folder.id)}
            >
              <Plus size={12} />
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Rename folder"
              onClick={() => { setRenameValue(folder.name); setRenaming(true); }}
            >
              <Pencil size={12} />
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              colorScheme="red"
              aria-label="Delete folder"
              onClick={() => onDeleteFolder(folder.id)}
            >
              <Trash2 size={12} />
            </IconButton>
          </Flex>
        )}
      </Flex>

      {/* Children */}
      {isExpanded && hasChildren && (
        <Box>
          {children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              notes={notes}
              selectedFolderId={selectedFolderId}
              expandedFolders={expandedFolders}
              onSelectFolder={onSelectFolder}
              onToggleExpand={onToggleExpand}
              onCreateFolder={onCreateFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              depth={depth + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
