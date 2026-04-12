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
    return <Text color="#718096" px={4}>No content available.</Text>;
  }

  // Track heading index for color rotation
  let headingIndex = 0;

  return (
    <Box p={4}>
      {lesson.content.map((item, idx) => {
        const Component = COMPONENT_MAP[item.type];
        if (!Component) return null;

        const extraProps = {};
        if (item.type === 'heading') {
          extraProps.index = headingIndex;
          headingIndex++;
        }

        return (
          <Box key={idx} my={3}>
            <Component {...item} {...extraProps} />
          </Box>
        );
      })}
    </Box>
  );
}

export default LessonRenderer;
