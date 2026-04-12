import React, { useState } from 'react';
import {
  Box, Button, Center, Flex, Heading, Input, Text, Spinner,
} from '@chakra-ui/react';
import { Brain, ArrowLeft, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <Box minH="full" bg="var(--bg-base)" py={10} px={4} color="var(--text-primary)">
      <Box maxW="3xl" mx="auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Flex align="center" justify="space-between" mb={8}>
            <Flex align="center" gap={3}>
              <Box w={10} h={10} rounded="xl" bg="rgba(var(--accent-rgb),0.08)" display="flex" alignItems="center" justifyContent="center">
                <Sparkles size={20} color="var(--accent)" />
              </Box>
              <Box>
                <Heading fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700" color="var(--text-primary)" letterSpacing="-0.01em">
                  Ask Your Notes
                </Heading>
                <Text fontSize="sm" color="var(--text-muted)">
                  AI-powered retrieval from your ingested notes
                </Text>
              </Box>
            </Flex>
            <Button variant="ghost" size="sm" onClick={() => navigate('/notes')} color="var(--text-muted)" _hover={{ color: 'var(--text-primary)' }} rounded="lg">
              <ArrowLeft size={14} />
              <Text ml={1.5} fontSize="xs">Notes</Text>
            </Button>
          </Flex>
        </motion.div>

        {/* Question input */}
        <Flex
          align="center"
          bg="var(--bg-elevated)"
          border="1px solid"
          borderColor="var(--border-subtle)"
          rounded="full"
          pl={5}
          pr={1.5}
          py={1.5}
          mb={6}
          _focusWithin={{ borderColor: 'var(--accent)', boxShadow: '0 0 0 1px rgba(var(--accent-rgb),0.2)' }}
          transition="all 0.2s"
          gap={3}
        >
          <Brain size={16} color="var(--text-dim)" style={{ flexShrink: 0 }} />
          <input
            placeholder="Ask a question about your notes..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              height: '36px',
              width: '100%',
              caretColor: 'var(--accent)',
            }}
          />
          <Button
            onClick={handleAsk}
            loading={loading}
            disabled={!question.trim()}
            size="sm"
            rounded="full"
            bg={question.trim() ? 'linear-gradient(135deg, var(--accent), var(--blue))' : 'var(--border-subtle)'}
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Box bg="rgba(var(--error-rgb),0.08)" border="1px solid" borderColor="rgba(var(--error-rgb),0.2)" rounded="xl" p={4} mb={6}>
              <Text color="#FC8181">{error}</Text>
            </Box>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Center py={8}>
              <Spinner size="md" color="var(--accent)" />
              <Text ml={4} color="var(--text-muted)">Searching your notes...</Text>
            </Center>
          </motion.div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Box bg="var(--bg-elevated)" rounded="xl" border="1px solid" borderColor="var(--border-base)" p={6} mb={6}>
              <Text fontSize="xs" fontWeight="600" color="var(--accent)" mb={3} textTransform="uppercase" letterSpacing="0.05em">Answer</Text>
              <MarkdownRenderer content={answer} />
            </Box>
          </motion.div>
        )}

        {/* Sources */}
        {context.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Box bg="var(--bg-elevated)" rounded="xl" border="1px solid" borderColor="var(--border-base)" p={6}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSources(!showSources)}
              color="var(--text-secondary)"
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
                  <Box key={i} bg="var(--bg-input)" rounded="lg" overflow="hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      w="100%"
                      justifyContent="space-between"
                      onClick={() => toggleChunk(i)}
                      px={4}
                      py={3}
                      h="auto"
                      color="var(--text-body)"
                      _hover={{ bg: 'var(--border-light)' }}
                    >
                      <Flex gap={2} align="center">
                        <Text fontSize="xs" color="blue.300" fontWeight="semibold">
                          {sources[i]?.source || 'unknown'}
                        </Text>
                        <Text fontSize="xs" color="var(--text-muted)">
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
          </motion.div>
        )}
      </Box>
    </Box>
  );
}
