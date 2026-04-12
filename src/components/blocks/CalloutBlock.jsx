import React from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import MathText from '../ui/MathText';
import { Lightbulb, AlertTriangle, Bookmark, Zap, Info } from 'lucide-react';

const VARIANTS = {
  tip: {
    icon: Lightbulb,
    label: 'Pro Tip',
    color: '#00C9A7',
    bg: 'rgba(0,201,167,0.06)',
    border: 'rgba(0,201,167,0.15)',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Watch Out',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.15)',
  },
  takeaway: {
    icon: Bookmark,
    label: 'Key Takeaway',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.06)',
    border: 'rgba(124,58,237,0.15)',
  },
  fun_fact: {
    icon: Zap,
    label: 'Fun Fact',
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.06)',
    border: 'rgba(236,72,153,0.15)',
  },
  info: {
    icon: Info,
    label: 'Note',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.06)',
    border: 'rgba(59,130,246,0.15)',
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
      <MathText color="#C4CDD8" fontSize="md" lineHeight="1.8">
        {text}
      </MathText>
    </Box>
  );
};

export default CalloutBlock;
