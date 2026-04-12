import React, { useState } from 'react';
import { Box, Text, VStack, Button, Flex, HStack } from '@chakra-ui/react';
import { CheckCircle, XCircle, RotateCcw, Lightbulb } from 'lucide-react';

const MCQBlock = ({ question, options, correctAnswer, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSelect = (index) => {
    if (!showAnswer) setSelected(index);
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
          bg: 'rgba(0,201,167,0.12)',
          borderColor: 'rgba(0,201,167,0.4)',
          color: '#00C9A7',
        };
      }
      if (i === selected && selected !== correctAnswer) {
        return {
          ...base,
          bg: 'rgba(239,68,68,0.1)',
          borderColor: 'rgba(239,68,68,0.4)',
          color: '#ef4444',
        };
      }
      return {
        ...base,
        bg: 'transparent',
        borderColor: 'whiteAlpha.50',
        color: 'gray.600',
      };
    }

    if (i === selected) {
      return {
        ...base,
        bg: 'rgba(59,130,246,0.12)',
        borderColor: 'rgba(59,130,246,0.4)',
        color: 'white',
      };
    }

    return {
      ...base,
      bg: 'rgba(255,255,255,0.02)',
      borderColor: 'whiteAlpha.50',
      color: 'gray.300',
      _hover: {
        bg: 'rgba(255,255,255,0.04)',
        borderColor: 'whiteAlpha.200',
        color: 'white',
      },
    };
  };

  return (
    <Box
      rounded="2xl"
      p={6}
      my={6}
      bg="rgba(255,255,255,0.02)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      w="full"
      color="white"
    >
      <Text fontWeight="semibold" fontSize="lg" mb={5} color="gray.200" lineHeight="1.6">
        {question}
      </Text>

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
                showAnswer && i === correctAnswer ? '#00C9A7' :
                showAnswer && i === selected && selected !== correctAnswer ? '#ef4444' :
                i === selected ? '#3B82F6' : 'whiteAlpha.200'
              }
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              fontSize="xs"
              fontWeight="bold"
              color={
                showAnswer && i === correctAnswer ? '#00C9A7' :
                i === selected ? '#3B82F6' : 'gray.500'
              }
            >
              {showAnswer && i === correctAnswer ? <CheckCircle size={14} /> :
               showAnswer && i === selected && selected !== correctAnswer ? <XCircle size={14} /> :
               String.fromCharCode(65 + i)}
            </Box>
            <Text flex={1}>{option}</Text>
          </Box>
        ))}
      </VStack>

      <Flex gap={3}>
        <Button
          onClick={() => setShowAnswer(true)}
          disabled={showAnswer || selected === null}
          bg="linear-gradient(135deg, #00C9A7, #3B82F6)"
          color="white"
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
          <Button
            onClick={resetQuiz}
            variant="ghost"
            color="gray.500"
            _hover={{ color: 'white', bg: 'whiteAlpha.50' }}
            rounded="xl"
            size="sm"
            h={9}
          >
            <RotateCcw size={14} />
            <Text ml={1.5}>Reset</Text>
          </Button>
        )}
      </Flex>

      {showAnswer && explanation && (
        <Box
          mt={5}
          p={4}
          bg="rgba(0,201,167,0.05)"
          border="1px solid"
          borderColor="rgba(0,201,167,0.15)"
          rounded="xl"
        >
          <HStack mb={2} gap={2}>
            <Lightbulb size={16} color="#00C9A7" />
            <Text fontWeight="semibold" fontSize="sm" color="#00C9A7">
              Explanation
            </Text>
          </HStack>
          <Text color="gray.400" fontSize="sm" lineHeight="1.7">{explanation}</Text>
        </Box>
      )}
    </Box>
  );
};

export default MCQBlock;
