import React, { useState } from 'react';
import {
  Box, Button, Center, Flex, Heading, Input, Text, Spinner,
} from '@chakra-ui/react';
import { Brain, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

export default function NotesRAG() {
  const navigate = useNavigate();
  const ragUrl = import.meta.env.VITE_RAG_URL;

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [context, setContext] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSources, setShowSources] = useState(false);
  const [openChunks, setOpenChunks] = useState({});

  const toggleChunk = (i) => {
    setOpenChunks((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    setSources([]);
    setContext([]);
    setError('');

    try {
      const res = await axios.post(`${ragUrl}/query`, {
        query: question,
        k: 5,
      });
      setAnswer(res.data.answer || 'No answer returned.');
      setSources(res.data.sources || []);
      setContext(res.data.context || []);
    } catch (err) {
      console.error('RAG query failed:', err);
      setError('Failed to get answer. Make sure the RAG service is running and you have ingested some notes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#06080F" py={10} px={4} color="white">
      <Center mb={8} flexDirection="column" textAlign="center">
        <Heading
          fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
          mb={4}
          fontWeight="800"
          letterSpacing="-0.02em"
          color="white"
        >
          Ask Your <Box as="span" color="#00C9A7">Notes</Box>
        </Heading>
        <Text color="gray.400" fontSize={{ base: 'md', md: 'lg' }} maxW="2xl">
          Ask questions about your ingested notes using AI-powered retrieval.
        </Text>
      </Center>

      <Box maxW="3xl" mx="auto">
        {/* Back button */}
        <Button variant="ghost" size="sm" mb={6} onClick={() => navigate('/notes')} color="gray.400">
          <ArrowLeft size={16} />
          <Text ml={2}>Back to Notes</Text>
        </Button>

        {/* Question input */}
        <Flex
          align="center"
          bg="rgba(255,255,255,0.03)"
          border="1px solid"
          borderColor="whiteAlpha.50"
          rounded="full"
          pl={5}
          pr={1.5}
          py={1.5}
          mb={6}
          _focusWithin={{ borderColor: '#00C9A7', boxShadow: '0 0 0 1px rgba(0,201,167,0.2)' }}
          transition="all 0.2s"
          gap={3}
        >
          <Brain size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
          <Input
            variant="unstyled"
            placeholder="Ask a question about your notes..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            color="white"
            fontSize="sm"
            h={9}
            _placeholder={{ color: 'whiteAlpha.300' }}
          />
          <Button
            onClick={handleAsk}
            loading={loading}
            disabled={!question.trim()}
            size="sm"
            rounded="full"
            bg={question.trim() ? 'linear-gradient(135deg, #00C9A7, #3B82F6)' : 'whiteAlpha.50'}
            color={question.trim() ? 'white' : 'gray.600'}
            _hover={{ opacity: 0.85 }}
            _disabled={{ opacity: 0.3, cursor: 'not-allowed' }}
            transition="all 0.15s"
            h={8}
            minW={8}
            px={4}
          >
            Ask
          </Button>
        </Flex>

        {/* Error */}
        {error && (
          <Box bg="red.900" border="1px solid" borderColor="red.600" rounded="xl" p={4} mb={6}>
            <Text color="red.200">{error}</Text>
          </Box>
        )}

        {/* Loading */}
        {loading && (
          <Center py={8}>
            <Spinner size="lg" color="blue.300" />
            <Text ml={4} color="gray.400">Searching your notes...</Text>
          </Center>
        )}

        {/* Answer */}
        {answer && !loading && (
          <Box bg="rgba(255,255,255,0.02)" rounded="xl" border="1px solid" borderColor="whiteAlpha.100" p={6} mb={6}>
            <Text fontSize="sm" fontWeight="semibold" color="blue.300" mb={3}>Answer</Text>
            <MarkdownRenderer content={answer} />
          </Box>
        )}

        {/* Sources */}
        {context.length > 0 && !loading && (
          <Box bg="rgba(255,255,255,0.02)" rounded="xl" border="1px solid" borderColor="whiteAlpha.100" p={6}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSources(!showSources)}
              color="gray.400"
              mb={showSources ? 4 : 0}
              w="100%"
              justifyContent="space-between"
            >
              <Text>Sources ({context.length} chunks)</Text>
              {showSources ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>

            {showSources && (
              <Flex direction="column" gap={2}>
                {context.map((chunk, i) => (
                  <Box key={i} bg="rgba(255,255,255,0.04)" rounded="lg" overflow="hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      w="100%"
                      justifyContent="space-between"
                      onClick={() => toggleChunk(i)}
                      px={4}
                      py={3}
                      h="auto"
                      color="gray.300"
                      _hover={{ bg: 'whiteAlpha.100' }}
                    >
                      <Flex gap={2} align="center">
                        <Text fontSize="xs" color="blue.300" fontWeight="semibold">
                          {sources[i]?.source || 'unknown'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Chunk #{sources[i]?.chunk_index ?? i}
                        </Text>
                      </Flex>
                      {openChunks[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </Button>
                    {openChunks[i] && (
                      <Box px={4} pb={4}>
                        <MarkdownRenderer content={chunk} />
                      </Box>
                    )}
                  </Box>
                ))}
              </Flex>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
