import React, { useMemo } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { renderMathInText } from '@/utils/mathUtils';

const WhiteboardBlock = ({ title, body = '' }) => {
  return (
    <Box
      my={6}
      p={6}
      bg="var(--bg-surface)"
      border="2px solid"
      borderColor="var(--border-base)"
      rounded="xl"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage:
          'radial-gradient(circle, var(--border-subtle) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }}
    >
      {/* Top bar with colored dots */}
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mb={4}
        pb={3}
        borderBottom="1px dashed"
        borderColor="var(--border-light)"
      >
        <Box w={3} h={3} rounded="full" bg="#FF6B6B" />
        <Box w={3} h={3} rounded="full" bg="#FFD93D" />
        <Box w={3} h={3} rounded="full" bg="#6BCB77" />
        {title && (
          <Text
            ml={2}
            fontSize="sm"
            fontWeight="600"
            color="var(--text-muted)"
            fontFamily="'Caveat', 'Segoe Print', 'Comic Sans MS', cursive"
            letterSpacing="0.02em"
          >
            {title}
          </Text>
        )}
      </Box>

      {/* Whiteboard content */}
      <Box position="relative" zIndex={1}>
        {body.split('\n').map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <Box key={i} h={3} />;

          // Lines starting with → or - or • are sub-items
          const isSubItem = /^[→\-•]/.test(trimmed);
          // Lines starting with a number + dot are steps
          const isStep = /^\d+[\.\)]/.test(trimmed);
          // Lines that look like equations or formulas (contain =, ≡, →, etc.)
          const isFormula = /[=≡→←∑∏∫≤≥±×÷√∞]/.test(trimmed) && trimmed.length < 120;

          const rendered = renderMathInText(trimmed);

          if (isFormula) {
            return (
              <Box
                key={i}
                my={2}
                mx={4}
                px={4}
                py={2}
                bg="rgba(var(--accent-rgb),0.06)"
                border="1px solid"
                borderColor="rgba(var(--accent-rgb),0.12)"
                rounded="md"
                display="inline-block"
              >
                <Text
                  fontFamily="'Caveat', 'Segoe Print', 'Comic Sans MS', cursive"
                  fontSize="xl"
                  color="var(--accent)"
                  fontWeight="700"
                  dangerouslySetInnerHTML={{ __html: rendered }}
                />
              </Box>
            );
          }

          return (
            <Text
              key={i}
              fontFamily="'Caveat', 'Segoe Print', 'Comic Sans MS', cursive"
              fontSize={isStep ? 'xl' : 'lg'}
              color={isStep ? 'var(--text-primary)' : isSubItem ? 'var(--text-secondary)' : 'var(--text-muted)'}
              fontWeight={isStep ? '700' : '400'}
              lineHeight="2"
              pl={isSubItem ? 6 : 0}
              my={isStep ? 1 : 0}
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          );
        })}
      </Box>

      {/* Chalk dust effect at bottom */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="1px"
        bg="linear-gradient(90deg, transparent, var(--border-subtle), transparent)"
      />
    </Box>
  );
};

export default WhiteboardBlock;
