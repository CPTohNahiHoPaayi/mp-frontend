import React from 'react';
import { Box } from '@chakra-ui/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/theme/ThemeContext';

export default function ThemePicker() {
  const { mode, toggleMode } = useTheme();

  return (
    <Box position="fixed" bottom={6} right={6} zIndex={9999}>
      <Box
        as="button"
        onClick={toggleMode}
        w={11}
        h={11}
        rounded="full"
        bg="var(--bg-surface)"
        border="1px solid"
        borderColor="var(--border-light)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        _hover={{ bg: 'var(--bg-hover)', transform: 'scale(1.08)' }}
        transition="all 0.2s"
        boxShadow="var(--shadow-card)"
      >
        {mode === 'dark' ? <Sun size={16} color="var(--text-muted)" /> : <Moon size={16} color="var(--text-muted)" />}
      </Box>
    </Box>
  );
}
