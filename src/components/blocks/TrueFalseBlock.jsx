import React, { useState } from 'react';
import { Box, Text, Flex, Button, HStack } from '@chakra-ui/react';
import MathText from '../ui/MathText';
import { CheckCircle, XCircle, RotateCcw, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

const TrueFalseBlock = ({ statement, answer, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (val) => {
    if (revealed) return;
    setSelected(val);
    setRevealed(true);
    if (val === answer) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
  };

  const isCorrect = selected === answer;

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
        <Box w="6px" h="6px" rounded="full" bg="#F59E0B" />
        <Text fontSize="xs" fontWeight="600" color="var(--warning)" textTransform="uppercase" letterSpacing="0.06em">
          True or False
        </Text>
      </Flex>

      <MathText color="var(--text-primary)" fontSize="md" lineHeight="1.8" mb={5}>
        {statement}
      </MathText>

      <HStack gap={3} mb={4}>
        {[true, false].map((val) => {
          const isThis = selected === val;
          const showCorrect = revealed && val === answer;
          const showWrong = revealed && isThis && !isCorrect;

          return (
            <Button
              key={String(val)}
              onClick={() => handleSelect(val)}
              flex={1}
              h={12}
              rounded="xl"
              border="1px solid"
              borderColor={
                showCorrect ? 'var(--accent)' :
                showWrong ? 'var(--error)' :
                isThis ? 'var(--blue)' : 'var(--border-base)'
              }
              bg={
                showCorrect ? 'rgba(var(--accent-rgb),0.08)' :
                showWrong ? 'rgba(var(--error-rgb),0.08)' :
                isThis ? 'rgba(var(--blue-rgb),0.08)' : 'transparent'
              }
              color={
                showCorrect ? 'var(--accent)' :
                showWrong ? 'var(--error)' :
                'var(--text-secondary)'
              }
              _hover={!revealed ? { borderColor: 'var(--blue)', bg: 'rgba(var(--blue-rgb),0.05)' } : {}}
              fontWeight="600"
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
              {showCorrect && <CheckCircle size={16} style={{ marginRight: 6 }} />}
              {showWrong && <XCircle size={16} style={{ marginRight: 6 }} />}
              {val ? 'True' : 'False'}
            </Button>
          );
        })}
      </HStack>

      {revealed && (
        <Flex align="center" gap={2} mt={3}>
          {isCorrect ? (
            <Text fontSize="sm" color="var(--accent)" fontWeight="500">Correct!</Text>
          ) : (
            <Text fontSize="sm" color="var(--error)" fontWeight="500">
              Wrong — the answer is {answer ? 'True' : 'False'}
            </Text>
          )}
          <Button size="xs" variant="ghost" color="var(--text-dim)" onClick={() => { setSelected(null); setRevealed(false); }} rounded="lg">
            <RotateCcw size={12} />
          </Button>
        </Flex>
      )}

      {revealed && explanation && (
        <Box mt={3} p={3} bg="rgba(var(--warning-rgb),0.05)" border="1px solid" borderColor="rgba(var(--warning-rgb),0.12)" rounded="lg">
          <Flex align="center" gap={1.5} mb={1}>
            <Lightbulb size={13} color="var(--warning)" />
            <Text fontSize="xs" fontWeight="600" color="var(--warning)">Explanation</Text>
          </Flex>
          <MathText fontSize="sm" color="var(--text-secondary)" lineHeight="1.7">{explanation}</MathText>
        </Box>
      )}
    </Box>
  );
};

export default TrueFalseBlock;
