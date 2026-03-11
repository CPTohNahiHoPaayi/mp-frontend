import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  Button,
  Flex,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { BsPatchCheckFill } from 'react-icons/bs';

const MCQBlock = ({ question, options, correctAnswer, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSelect = (index) => {
    if (!showAnswer) {
      setSelected(index);
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
      p: 3,
      borderWidth: 1.5,
      rounded: 'md',
      transition: 'all 0.2s',
      cursor: 'pointer',
      userSelect: 'none',
      fontWeight: 'medium',
      fontSize: 'md',
    };

    if (showAnswer) {
      if (i === correctAnswer) {
        return {
          ...base,
          bg: '#5cb85c',           // green
          borderColor: '#4cae4c',
          color: 'black',
        };
      }
      if (i === selected && selected !== correctAnswer) {
        return {
          ...base,
          bg: 'red.500',
          borderColor: '#777',
          color: 'black',
        };
      }
      return {
        ...base,
        bg: '#2a2a2a',
        borderColor: '#555',
        color: '#aaa',
      };
    }

    if (i === selected) {
      return {
        ...base,
        bg: '#77aaff',            // selected blue
        borderColor: '#77aaff',
        color: '#fff',
      };
    }

    return {
      ...base,
      bg: '#2d2f36',
      borderColor: '#555',
      color: '#e0e0e0',
      _hover: {
        bg: '#393b44',
        borderColor: '#77aaff',
        color: '#ffffff',
      },
    };
  };

  return (
    <Box
      borderWidth={1}
      rounded="xl"
      p={6}
      my={8}
      bg="#1b1c22"
      shadow="md"
      w="full"
      color="white"
    >
      {/* Question */}
      <Text fontWeight="" fontSize="xl" mb={5} color="#dcdcdc">
        {question}
      </Text>

      {/* Options */}
      <VStack spacing={3} mb={4} w="full">
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

      {/* Action Buttons */}
      <Flex justify="space-between" mt={6}>
        <Button
          onClick={() => setShowAnswer(true)}
          isDisabled={showAnswer}
          bg="#77aaff"
          color="#1a1a1a"
          _hover={{ bg: '#4d9efc' }}
          _disabled={{ bg: '#555', cursor: 'not-allowed', color: '#ccc' }}
          size="sm"
        >
          {showAnswer ? 'Answer Shown' : 'Show Answer'}
        </Button>

        {showAnswer && (
          <Button
            onClick={resetQuiz}
            variant="outline"
            borderColor="#77aaff"
            color="#77aaff"
            _hover={{ bg: '#1e1e1e' }}
            size="sm"
          >
            Reset
          </Button>
        )}
      </Flex>

      {/* Explanation */}
      {showAnswer && explanation && (
        <Box
          mt={6}
          p={4}
          bg="#25262b"
          border="1px solid"
          borderColor="#77aaff"
          rounded="md"
          w="full"
        >
          <HStack mb={2}>
            <Icon as={BsPatchCheckFill} color="#77aaff" />
            <Text fontWeight="bold" color="#77aaff">
              Explanation:
            </Text>
          </HStack>
          <Text color="#ccc">{explanation}</Text>
        </Box>
      )}
    </Box>
  );
};

export default MCQBlock;
