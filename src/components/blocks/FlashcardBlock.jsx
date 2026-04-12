import React, { useState } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import MathText from '../ui/MathText';
import { RotateCcw, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const FlashcardBlock = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <Box my={6}>
      <Flex align="center" gap={2} mb={3}>
        <Box w="6px" h="6px" rounded="full" bg="#3B82F6" />
        <Text fontSize="xs" fontWeight="600" color="#60A5FA" textTransform="uppercase" letterSpacing="0.06em">
          Flashcard
        </Text>
      </Flex>

      <Box
        perspective="1000px"
        cursor="pointer"
        onClick={() => setFlipped(!flipped)}
        h="180px"
        position="relative"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
        >
          {/* Front */}
          <Flex
            position="absolute"
            inset={0}
            bg="linear-gradient(135deg, rgba(59,130,246,0.08), rgba(124,58,237,0.06))"
            border="1px solid"
            borderColor="#1E2536"
            rounded="xl"
            align="center"
            justify="center"
            p={6}
            style={{ backfaceVisibility: 'hidden' }}
            direction="column"
            gap={3}
          >
            <Eye size={18} color="#60A5FA" />
            <MathText color="#E2E8F0" fontSize="lg" fontWeight="600" textAlign="center" lineHeight="1.6">
              {front}
            </MathText>
            <Text fontSize="xs" color="#4A5568" mt={2}>Click to reveal</Text>
          </Flex>

          {/* Back */}
          <Flex
            position="absolute"
            inset={0}
            bg="linear-gradient(135deg, rgba(0,201,167,0.08), rgba(16,185,129,0.06))"
            border="1px solid"
            borderColor="#1E2536"
            rounded="xl"
            align="center"
            justify="center"
            p={6}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            direction="column"
            gap={3}
          >
            <MathText color="#00C9A7" fontSize="md" fontWeight="600" textAlign="center" lineHeight="1.7">
              {back}
            </MathText>
            <Text fontSize="xs" color="#4A5568" mt={2}>Click to flip back</Text>
          </Flex>
        </motion.div>
      </Box>
    </Box>
  );
};

export default FlashcardBlock;
