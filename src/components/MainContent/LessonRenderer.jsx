import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import HeadingBlock from '../blocks/HeadingBlock';
import ParagraphBlock from '../blocks/ParagraphBlock';
import CodeBlock from '../blocks/CodeBlock';
import VideoBlock from '../blocks/VideoBlock';
import MCQBlock from '../blocks/MCQBlock';

const COMPONENT_MAP = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  code: CodeBlock,
  video: VideoBlock,
  mcq: MCQBlock,
};

function LessonRenderer({ lesson }) {
  if (!lesson?.content || !Array.isArray(lesson.content)) {
    return <Text color="gray.500" px={4}>No content available.</Text>;
  }

  return (
    <Box p={4}>
      {lesson.content.map((item, idx) => {
        const Component = COMPONENT_MAP[item.type];
        if (!Component) return null;

        return (
          <Box key={idx} my={4}>
            <Component {...item} />
          </Box>
        );
      })}
    </Box>
  );
}

export default LessonRenderer;
