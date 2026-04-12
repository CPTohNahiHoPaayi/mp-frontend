import React, { useState } from 'react';
import { Box, Text, VStack, Button, Flex, HStack } from '@chakra-ui/react';
import MathText from '../ui/MathText';
import { CheckCircle, XCircle, RotateCcw, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

const MCQBlock = ({ question, options, correctAnswer, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSelect = (index) => {
    if (!showAnswer) setSelected(index);
  };

  const handleCheck = () => {
    setShowAnswer(true);
    if (selected === correctAnswer) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
    }
  };

  const resetQuiz = () => {
    setSelected(null);
    setShowAnswer(false);
  };

  const getOptionStyles = (i) => {
    const base = {
      w: 'full',
      textAlign: 'left',
      px: 4,
      py: 3,
      rounded: 'xl',
      transition: 'all 0.2s',
      cursor: showAnswer ? 'default' : 'pointer',
      userSelect: 'none',
      fontWeight: 'medium',
      fontSize: 'md',
      border: '1px solid',
    };

    if (showAnswer) {
      if (i === correctAnswer) {
        return {
          ...base,
          bg: 'rgba(var(--accent-rgb),0.12)',
          borderColor: 'rgba(var(--accent-rgb),0.4)',
          color: 'var(--accent)',
        };
      }
      if (i === selected && selected !== correctAnswer) {
        return {
          ...base,
          bg: 'rgba(var(--error-rgb),0.1)',
          borderColor: 'rgba(var(--error-rgb),0.4)',
          color: 'var(--error)',
        };
      }
      return {
        ...base,
        bg: 'transparent',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-dim)',
      };
    }

    if (i === selected) {
      return {
        ...base,
        bg: 'rgba(var(--blue-rgb),0.12)',
        borderColor: 'rgba(var(--blue-rgb),0.4)',
        color: 'var(--text-primary)',
      };
    }

    return {
      ...base,
      bg: 'var(--bg-elevated)',
      borderColor: 'var(--border-subtle)',
      color: 'var(--text-body)',
      _hover: {
        bg: 'var(--bg-input)',
        borderColor: 'var(--border-hover)',
        color: 'var(--text-primary)',
      },
    };
  };

  return (
    <Box
      rounded="2xl"
      p={6}
      my={6}
      bg="var(--bg-elevated)"
      border="1px solid"
      borderColor="var(--border-light)"
      w="full"
      color="var(--text-primary)"
    >
      <MathText fontWeight="semibold" fontSize="lg" mb={5} color="var(--text-primary)" lineHeight="1.6">
        {question}
      </MathText>

      <VStack gap={2} mb={5} w="full">
        {options.map((option, i) => (
          <Box
            key={i}
            as="button"
            {...getOptionStyles(i)}
            onClick={() => handleSelect(i)}
            display="flex"
            alignItems="center"
            gap={3}
          >
            <Box
              w={6}
              h={6}
              rounded="full"
              border="2px solid"
              borderColor={
                showAnswer && i === correctAnswer ? 'var(--accent)' :
                showAnswer && i === selected && selected !== correctAnswer ? 'var(--error)' :
                i === selected ? 'var(--blue)' : 'var(--border-hover)'
              }
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              fontSize="xs"
              fontWeight="bold"
              color={
                showAnswer && i === correctAnswer ? 'var(--accent)' :
                i === selected ? 'var(--blue)' : 'gray.500'
              }
            >
              {showAnswer && i === correctAnswer ? <CheckCircle size={14} /> :
               showAnswer && i === selected && selected !== correctAnswer ? <XCircle size={14} /> :
               String.fromCharCode(65 + i)}
            </Box>
            <MathText flex={1}>{option}</MathText>
          </Box>
        ))}
      </VStack>

      <Flex gap={3}>
        <Button
          onClick={handleCheck}
          disabled={showAnswer || selected === null}
          bg="linear-gradient(135deg, var(--accent), var(--blue))"
          color="var(--text-primary)"
          _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
          _disabled={{ opacity: 0.3, cursor: 'not-allowed', transform: 'none' }}
          rounded="xl"
          size="sm"
          h={9}
          px={5}
          transition="all 0.2s"
        >
          {showAnswer ? 'Revealed' : 'Check Answer'}
        </Button>

        {showAnswer && (
          <>
            <Text fontSize="sm" fontWeight="500" color={selected === correctAnswer ? 'var(--accent)' : 'var(--error)'}>
              {selected === correctAnswer ? '🎉 Correct!' : '😔 Not quite'}
            </Text>
            <Button
              onClick={resetQuiz}
              variant="ghost"
              color="var(--text-dim)"
              _hover={{ color: 'var(--text-secondary)' }}
              rounded="xl"
              size="sm"
              h={9}
            >
              <RotateCcw size={14} />
              <Text ml={1.5}>Reset</Text>
            </Button>
          </>
        )}
      </Flex>

      {showAnswer && explanation && (
        <Box
          mt={5}
          p={4}
          bg="rgba(var(--accent-rgb),0.05)"
          border="1px solid"
          borderColor="rgba(var(--accent-rgb),0.15)"
          rounded="xl"
        >
          <HStack mb={2} gap={2}>
            <Lightbulb size={16} color="var(--accent)" />
            <Text fontWeight="semibold" fontSize="sm" color="var(--accent)">
              Explanation
            </Text>
          </HStack>
          <MathText color="var(--text-secondary)" fontSize="sm" lineHeight="1.7">{explanation}</MathText>
        </Box>
      )}
    </Box>
  );
};

export default MCQBlock;
