import React from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import MathText from '../ui/MathText';
import { Lightbulb, AlertTriangle, Bookmark, Zap, Info } from 'lucide-react';

const VARIANTS = {
  tip: {
    icon: Lightbulb,
    label: 'Pro Tip',
    color: 'var(--accent)',
    bg: 'rgba(var(--accent-rgb),0.06)',
    border: 'rgba(var(--accent-rgb),0.15)',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Watch Out',
    color: 'var(--warning)',
    bg: 'rgba(var(--warning-rgb),0.06)',
    border: 'rgba(var(--warning-rgb),0.15)',
  },
  takeaway: {
    icon: Bookmark,
    label: 'Key Takeaway',
    color: 'var(--purple)',
    bg: 'rgba(var(--purple-rgb),0.06)',
    border: 'rgba(var(--purple-rgb),0.15)',
  },
  fun_fact: {
    icon: Zap,
    label: 'Fun Fact',
    color: 'var(--pink)',
    bg: 'rgba(var(--pink-rgb),0.06)',
    border: 'rgba(var(--pink-rgb),0.15)',
  },
  info: {
    icon: Info,
    label: 'Note',
    color: 'var(--blue)',
    bg: 'rgba(var(--blue-rgb),0.06)',
    border: 'rgba(var(--blue-rgb),0.15)',
  },
};

const CalloutBlock = ({ variant = 'tip', text }) => {
  const v = VARIANTS[variant] || VARIANTS.tip;
  const Icon = v.icon;

  return (
    <Box
      my={6}
      p={5}
      bg={v.bg}
      border="1px solid"
      borderColor={v.border}
      borderLeft="4px solid"
      borderLeftColor={v.color}
      rounded="lg"
      roundedLeft="sm"
    >
      <Flex align="center" gap={2} mb={2}>
        <Icon size={16} color={v.color} />
        <Text fontSize="xs" fontWeight="700" color={v.color} textTransform="uppercase" letterSpacing="0.06em">
          {v.label}
        </Text>
      </Flex>
      <MathText color="var(--text-body)" fontSize="md" lineHeight="1.8">
        {text}
      </MathText>
    </Box>
  );
};

export default CalloutBlock;
