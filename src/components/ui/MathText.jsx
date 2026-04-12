import React, { useMemo } from 'react';
import { Text } from '@chakra-ui/react';
import { renderMathInText } from '@/utils/mathUtils';

const MathText = ({ children, ...props }) => {
  const html = useMemo(() => {
    if (typeof children !== 'string') return null;
    return renderMathInText(children);
  }, [children]);

  if (!html || html === children) {
    return <Text {...props}>{children}</Text>;
  }

  return <Text {...props} dangerouslySetInnerHTML={{ __html: html }} />;
};

export default MathText;
