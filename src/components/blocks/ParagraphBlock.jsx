import React from 'react';
import { Box } from '@chakra-ui/react';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

const ParagraphBlock = ({ text }) => {
  return (
    <Box mt={4}>
      <MarkdownRenderer content={text} />
    </Box>
  );
};

export default ParagraphBlock;
