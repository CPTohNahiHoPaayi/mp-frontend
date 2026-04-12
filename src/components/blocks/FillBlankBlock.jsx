import React, { useState } from 'react';
import { Box, Text, Flex, Button, HStack } from '@chakra-ui/react';
import { CheckCircle, XCircle, RotateCcw, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

const FillBlankBlock = ({ sentence, answer, options, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    if (opt.toLowerCase().trim() === answer.toLowerCase().trim()) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
  };

  const isCorrect = selected && selected.toLowerCase().trim() === answer.toLowerCase().trim();

  // Replace _____ in sentence with the answer or blank
  const renderSentence = () => {
    const parts = sentence.split('_____');
    return (
      <Text color="var(--text-primary)" fontSize="md" lineHeight="1.8">
        {parts[0]}
        <Text
          as="span"
          px={2}
          py={0.5}
          mx={1}
          rounded="md"
          fontWeight="700"
          bg={
            !revealed ? 'rgba(var(--purple-rgb),0.12)' :
            isCorrect ? 'rgba(var(--accent-rgb),0.12)' : 'rgba(var(--error-rgb),0.12)'
          }
          color={
            !revealed ? 'var(--purple-light)' :
            isCorrect ? 'var(--accent)' : 'var(--error)'
          }
          borderBottom="2px dashed"
          borderColor={
            !revealed ? 'var(--purple)' :
            isCorrect ? 'var(--accent)' : 'var(--error)'
          }
          transition="all 0.3s"
        >
          {revealed ? (isCorrect ? selected : `${selected} → ${answer}`) : '______'}
        </Text>
        {parts[1] || ''}
      </Text>
    );
  };

  return (
    <Box
      my={6}
      p={5}
      bg="var(--bg-elevated)"
      border="1px solid"
      borderColor="var(--border-base)"
      rounded="xl"
    >
      <Flex align="center" gap={2} mb={4}>
        <Box w="6px" h="6px" rounded="full" bg="#7C3AED" />
        <Text fontSize="xs" fontWeight="600" color="var(--purple-light)" textTransform="uppercase" letterSpacing="0.06em">
          Fill in the Blank
        </Text>
      </Flex>

      <Box mb={5}>{renderSentence()}</Box>

      <HStack gap={2} flexWrap="wrap" mb={3}>
        {options.map((opt, i) => {
          const isThis = selected === opt;
          const isAnswer = opt.toLowerCase().trim() === answer.toLowerCase().trim();
          const showCorrect = revealed && isAnswer;
          const showWrong = revealed && isThis && !isCorrect;

          return (
            <Button
              key={i}
              onClick={() => handleSelect(opt)}
              size="sm"
              rounded="full"
              border="1px solid"
              borderColor={
                showCorrect ? 'var(--accent)' :
                showWrong ? 'var(--error)' :
                isThis ? 'var(--purple)' : 'var(--border-base)'
              }
              bg={
                showCorrect ? 'rgba(var(--accent-rgb),0.08)' :
                showWrong ? 'rgba(var(--error-rgb),0.08)' :
                isThis ? 'rgba(var(--purple-rgb),0.08)' : 'transparent'
              }
              color={
                showCorrect ? 'var(--accent)' :
                showWrong ? 'var(--error)' : 'var(--text-secondary)'
              }
              _hover={!revealed ? { borderColor: 'var(--purple)', bg: 'rgba(var(--purple-rgb),0.05)' } : {}}
              px={4}
              h={8}
              fontWeight="500"
              fontSize="sm"
              transition="all 0.2s"
              animation={showWrong ? 'shake 0.4s ease' : undefined}
              sx={{
                '@keyframes shake': {
                  '0%, 100%': { transform: 'translateX(0)' },
                  '20%, 60%': { transform: 'translateX(-6px)' },
                  '40%, 80%': { transform: 'translateX(6px)' },
                },
              }}
            >
              {showCorrect && <CheckCircle size={13} style={{ marginRight: 4 }} />}
              {showWrong && <XCircle size={13} style={{ marginRight: 4 }} />}
              {opt}
            </Button>
          );
        })}
      </HStack>

      {revealed && (
        <Flex align="center" gap={2}>
          <Text fontSize="sm" color={isCorrect ? 'var(--accent)' : 'var(--error)'} fontWeight="500">
            {isCorrect ? 'Correct!' : 'Not quite.'}
          </Text>
          <Button size="xs" variant="ghost" color="var(--text-dim)" onClick={() => { setSelected(null); setRevealed(false); }} rounded="lg">
            <RotateCcw size={12} />
          </Button>
        </Flex>
      )}

      {revealed && explanation && (
        <Box mt={3} p={3} bg="rgba(var(--purple-rgb),0.05)" border="1px solid" borderColor="rgba(var(--purple-rgb),0.12)" rounded="lg">
          <Flex align="center" gap={1.5} mb={1}>
            <Lightbulb size={13} color="var(--purple-light)" />
            <Text fontSize="xs" fontWeight="600" color="var(--purple-light)">Explanation</Text>
          </Flex>
          <Text fontSize="sm" color="var(--text-secondary)" lineHeight="1.7">{explanation}</Text>
        </Box>
      )}
    </Box>
  );
};

export default FillBlankBlock;
