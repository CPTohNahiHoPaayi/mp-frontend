import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack
} from '@chakra-ui/react';
import { BsDot } from 'react-icons/bs';

const ParagraphBlock = ({ text }) => {
  const renderLineWithBold = (line, keyPrefix) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g); // split bold segments
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text
            as="span"
            key={`${keyPrefix}-bold-${idx}`}
            fontSize="xl"
            color="#89b4fa"
            lineHeight="shorter"
            letterSpacing="-0.3px"
          >
            {part.slice(2, -2)}
          </Text>
        );
      } else {
        return (
          <Text
            as="span"
            key={`${keyPrefix}-text-${idx}`}
            color="gray.200"
            fontSize="xl"
          >
            {part}
          </Text>
        );
      }
    });
  };

  const renderParsedText = (input) => {
    if (!input) return null;

    const lines = input.split('\n');
    const elements = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('*')) {
        elements.push(
          <HStack align="start" key={`bullet-${i}`} spacing={1} ml={4} mb={2}>
            <Box pt="6px">
              <BsDot color="#f9e2af" />
            </Box>
            <Text fontSize="xl" color="gray.200">
              {renderLineWithBold(trimmed.slice(1).trim(), `bullet-${i}`)}
            </Text>
          </HStack>
        );
      } else if (trimmed) {
        elements.push(
          <Text key={`line-${i}`} fontSize="xl" color="gray.200" mb={3}>
            {renderLineWithBold(trimmed, `line-${i}`)}
          </Text>
        );
      }
    });

    return elements;
  };

  return (
    <Box mt={4}>
      {renderParsedText(text)}
    </Box>
  );
};

export default ParagraphBlock;
