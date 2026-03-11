import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  Button,
  useColorModeValue,
  chakra,
} from '@chakra-ui/react';

const MCQBlock = ({ question, options, correctIndex, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSelect = (index) => {
    if (!showAnswer) {
      setSelected(index);
    }
  };

  const getOptionStyles = (i) => {
    const base = {
      w: 'full',
      textAlign: 'left',
      p: 3,
      borderWidth: 1,
      rounded: 'md',
      transition: 'all 0.2s',
      cursor: 'pointer',
      userSelect: 'none',
    };

    if (showAnswer) {
      if (i === correctIndex)
        return {
          ...base,
          bg: 'green.100',
          borderColor: 'green.500',
          color: 'green.900',
        };
      if (i === selected && selected !== correctIndex)
        return {
          ...base,
          bg: 'red.100',
          borderColor: 'red.500',
          color: 'red.900',
        };
      return {
        ...base,
        bg: useColorModeValue('gray.50', 'gray.700'),
        borderColor: 'gray.300',
        color: useColorModeValue('gray.800', 'gray.100'),
      };
    }

    if (i === selected) {
      return {
        ...base,
        bg: 'blue.100',
        borderColor: 'blue.400',
      };
    }

    return {
      ...base,
      borderColor: 'gray.300',
      _hover: { bg: useColorModeValue('gray.100', 'gray.600') },
    };
  };

  return (
    <Box
      borderWidth={1}
      rounded="xl"
      p={6}
      bg={useColorModeValue('white', 'gray.800')}
      shadow="md"
      maxW="xl"
      mx="auto"
    >
      <Text fontWeight="semibold" fontSize="lg" mb={4}>
        {question}
      </Text>

      <VStack spacing={3} mb={4}>
        {options.map((option, i) => (
          <Box
            key={i}
            as="button"
            {...getOptionStyles(i)}
            onClick={() => handleSelect(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(i);
              }
            }}
            tabIndex={0}
            role="button"
            aria-pressed={selected === i}
            aria-disabled={showAnswer}
          >
            <Text>{option}</Text>
          </Box>
        ))}
      </VStack>

      <Button
        onClick={() => setShowAnswer(true)}
        isDisabled={showAnswer}
        colorScheme={showAnswer ? 'gray' : 'blue'}
        mb={2}
      >
        {showAnswer ? 'Answer Shown' : 'Show Answer'}
      </Button>

      {showAnswer && explanation && (
        <Box
          mt={4}
          p={4}
          bg="blue.50"
          border="1px"
          borderColor="blue.300"
          rounded="md"
          color="gray.800"
        >
          <Text fontWeight="bold" mb={1}>
            Explanation:
          </Text>
          <Text>{explanation}</Text>
        </Box>
      )}
    </Box>
  );
};

export default MCQBlock;
