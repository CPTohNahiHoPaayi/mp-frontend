import React, { useState } from 'react';
import {
  Box, Button, Center, Flex, Heading, Text, Textarea, Spinner,
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
    <Box minH="100vh" bg="gray.900" py={10} px={4} color="white">
      <Center mb={8} flexDirection="column" textAlign="center">
        <Heading
          fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
          mb={4}
          bg="linear-gradient(135deg, #1e3a5f 0%, #2563EB 50%, #7c3aed 100%)"
          bgClip="text"
          fontWeight="extrabold"
        >
          Ask Your Notes
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
        <Box bg="gray.800" rounded="xl" border="1px solid" borderColor="gray.700" p={6} mb={6}>
          <Textarea
            placeholder="Ask a question about your notes..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            bg="gray.700"
            border="none"
            color="white"
            _placeholder={{ color: 'gray.500' }}
            minH="100px"
            resize="vertical"
            mb={4}
          />
          <Flex justify="flex-end">
            <Button
              colorScheme="blue"
              onClick={handleAsk}
              loading={loading}
              disabled={!question.trim()}
              size="lg"
            >
              <Brain size={18} />
              <Text ml={2}>Ask</Text>
            </Button>
          </Flex>
        </Box>

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
          <Box bg="gray.800" rounded="xl" border="1px solid" borderColor="gray.700" p={6} mb={6}>
            <Text fontSize="sm" fontWeight="semibold" color="blue.300" mb={3}>Answer</Text>
            <MarkdownRenderer content={answer} />
          </Box>
        )}

        {/* Sources */}
        {context.length > 0 && !loading && (
          <Box bg="gray.800" rounded="xl" border="1px solid" borderColor="gray.700" p={6}>
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
                  <Box key={i} bg="gray.700" rounded="lg" overflow="hidden">
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
                      _hover={{ bg: 'gray.600' }}
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
