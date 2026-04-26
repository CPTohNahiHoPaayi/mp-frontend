'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Text,
  Heading,
  HStack,
  IconButton,
  Stack,
  Input,
  Button,
  Spinner,
  VStack,
  SimpleGrid,
  Flex,
  Badge,
  Code,
} from '@chakra-ui/react';
import { Sparkles, Send, BookOpen, Zap, Brain, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { toaster } from '@/components/ui/toaster';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import CourseCard from './CourseCard';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const LEVEL_OPTIONS = [
  { value: 0, label: 'Absolute Beginner' },
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
  { value: 4, label: 'Expert' },
];

const STYLE_OPTIONS = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'hands_on', label: 'Hands-On' },
  { value: 'visual', label: 'Visual' },
  { value: 'conceptual', label: 'Conceptual' },
  { value: 'example_driven', label: 'Examples' },
];


function RLMGenerationView({ events, isComplete, error }) {
  const bottomRef = useRef(null);
  const [showCode, setShowCode] = useState(false);

  // Scroll only WITHIN the event log container, not the whole page
  const logContainerRef = useRef(null);
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events]);

  const subCalls = events.filter(e => e.event === 'sub_llm_call').length;
  const latestIteration = events.filter(e => e.event === 'iteration').slice(-1)[0];
  const currentStep = latestIteration?.data?.iteration || 0;
  const maxSteps = latestIteration?.data?.max || 15;
  const latestCode = events.filter(e => e.event === 'code').slice(-1)[0];
  const latestOutput = events.filter(e => e.event === 'output').slice(-1)[0];

  return (
    <Box
      bg="var(--bg-elevated)"
      border="1px solid"
      borderColor="var(--border-subtle)"
      borderRadius="xl"
      overflow="hidden"
      maxW="700px"
      mx="auto"
    >
      {/* Header */}
      <Flex p={3} justify="space-between" align="center" borderBottom="1px solid" borderColor="var(--border-subtle)">
        <HStack gap={2}>
          <Brain size={16} color={isComplete ? '#48bb78' : 'var(--accent)'} />
          <Text fontSize="sm" fontWeight="bold" color="var(--text-primary)">RLM Agent</Text>
          <Badge colorScheme={isComplete ? 'green' : error ? 'red' : 'blue'} fontSize="10px" variant="subtle">
            {isComplete ? 'Complete!' : error ? 'Error' : `${currentStep} iterations`}
          </Badge>
        </HStack>
        <HStack gap={2}>
          <Badge variant="outline" fontSize="10px">{subCalls} sub-LLM calls</Badge>
        </HStack>
      </Flex>

      {/* Progress bar */}
      <Box h="3px" bg="var(--border-subtle)">
        <Box
          h="full"
          bg={isComplete ? 'green.400' : 'var(--accent)'}
          w={`${isComplete ? 100 : Math.round((currentStep / maxSteps) * 100)}%`}
          transition="width 0.5s ease"
        />
      </Box>

      {/* Event log */}
      <div ref={logContainerRef} style={{ maxHeight: '300px', overflowY: 'auto', padding: '12px', fontFamily: 'monospace' }}>
        {events.map((evt, idx) => {
          const labels = {
            iteration: `Iteration ${evt.data.iteration}`,
            code: `Agent wrote ${evt.data.code?.split('\n').length || 0} lines of code`,
            output: `REPL: ${evt.data.output?.slice(0, 80)}...`,
            sub_llm_call: `Sub-LLM #${evt.data.call_number}: ${evt.data.query?.slice(0, 60)}...`,
            sub_llm_result: `Sub-LLM #${evt.data.call_number} returned`,
            error: evt.data.message,
            complete: `Done! ${evt.data.iterations} steps, ${evt.data.sub_calls} sub-calls`,
          };
          const icons = { iteration: '🔄', code: '📝', output: '📤', sub_llm_call: '🧠', sub_llm_result: '✨', error: '❌', complete: '✅' };
          const colors = { iteration: 'var(--accent, #2b6cb0)', code: 'var(--text-primary, #276749)', output: 'var(--text-secondary, #4a5568)', sub_llm_call: 'var(--accent, #6b46c1)', sub_llm_result: 'var(--text-muted, #805ad5)', error: '#e53e3e', complete: 'var(--text-primary, #276749)' };
          const label = labels[evt.event] || evt.event;
          const icon = icons[evt.event] || '•';
          const color = colors[evt.event] || 'var(--text-secondary, #4a5568)';
          return (
            <p key={idx} style={{ color, fontSize: '12px', lineHeight: '1.8', margin: 0 }}>
              {icon} {label}
            </p>
          );
        })}
        {error && <p style={{ color: '#e53e3e', fontSize: '12px', margin: 0 }}>❌ {error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Expandable code */}
      {latestCode && (
        <Box borderTop="1px solid" borderColor="var(--border-subtle)">
          <Flex p={2} cursor="pointer" onClick={() => setShowCode(!showCode)} align="center" justify="space-between" _hover={{ bg: 'var(--bg-secondary)' }}>
            <Text fontSize="xs" fontWeight="bold" color="var(--text-muted)">Latest Agent Code</Text>
            {showCode ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </Flex>
          {showCode && (
            <Box p={2} maxH="150px" overflowY="auto">
              <Code display="block" whiteSpace="pre-wrap" fontSize="10px" p={2} bg="gray.900" color="green.300" borderRadius="md">
                {latestCode.data.code}
              </Code>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function MiniCourseCreator({ onCourseGenerated }) {
  const { token } = useAuth();
  const baseURL = import.meta.env.VITE_API_URL;
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [level, setLevel] = useState(2);
  const [style, setStyle] = useState('balanced');
  const [knownTopics, setKnownTopics] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [showGeneration, setShowGeneration] = useState(false);
  const [events, setEvents] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const rlmUrl = import.meta.env.VITE_RLM_URL || 'http://localhost:9000';

  const handleClick = () => {
    if (!topic.trim()) {
      toaster.create({ description: 'Topic is required.', type: 'warning' });
      return;
    }

    setLoading(true);
    setShowGeneration(true);
    setEvents([]);
    setIsComplete(false);
    setError(null);

    const body = JSON.stringify({
      topic: topic.trim(),
      preferences: {
        level,
        style,
        known_topics: knownTopics.split(',').map(s => s.trim()).filter(Boolean),
        learning_goal: learningGoal.trim(),
      },
    });

    fetch(`${rlmUrl}/api/rlm/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
      .then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function processBuffer() {
          // SSE events are separated by double newlines
          const parts = buffer.split('\n\n');
          // Keep the last incomplete part in the buffer
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (!part.trim()) continue;
            const lines = part.split('\n');
            let eventType = null;
            let dataStr = null;

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                dataStr = line.slice(5).trim();
              }
            }

            if (eventType && dataStr) {
              try {
                const data = JSON.parse(dataStr);
                console.log(`[SSE] ${eventType}:`, data);
                setEvents(prev => [...prev, { event: eventType, data }]);
                if (eventType === 'complete') {
                  setIsComplete(true);
                  setLoading(false);
                  try {
                    const courseObj = JSON.parse(data.course);
                    // Only save if course has modules with lessons
                    const totalLessons = (courseObj.modules || []).reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
                    if (!courseObj.modules?.length || totalLessons === 0) {
                      console.error('[RLM] Invalid course - no modules or lessons');
                      toaster.create({ description: 'Generation failed - empty course. Try again.', type: 'error' });
                      return;
                    }
                    console.log(`[RLM] Saving course: ${courseObj.title} (${courseObj.modules.length} modules, ${totalLessons} lessons)`);
                    axios.post(`${baseURL}/api/courses/save-rlm`, courseObj, {
                      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    }).then(() => {
                      toaster.create({ description: `Course saved! ${courseObj.modules.length} modules, ${totalLessons} lessons`, type: 'success' });
                      // Refetch courses after a brief delay to ensure DB write is complete
                      setTimeout(() => { if (onCourseGenerated) onCourseGenerated(); }, 500);
                    }).catch(err => {
                      console.error('[RLM] Save failed:', err);
                      toaster.create({ description: 'Generated but save failed', type: 'warning' });
                    });
                  } catch (e) {
                    console.error('[RLM] Parse error:', e);
                  }
                }
                if (eventType === 'error') setError(data.message);
              } catch (e) {
                console.warn('[SSE] JSON parse error:', e, dataStr?.slice(0, 200));
              }
            }
          }
        }

        function read() {
          reader.read().then(({ done, value }) => {
            if (done) { setLoading(false); return; }
            buffer += decoder.decode(value, { stream: true });
            processBuffer();
            read();
          });
        }
        read();
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        toaster.create({ description: `Connection failed: ${err.message}`, type: 'error' });
      });
  };

  return (
    <Box maxW="700px" mx="auto">
      {/* Search bar */}
      <Flex
        align="center"
        gap={3}
        bg="var(--bg-elevated)"
        border="1px solid"
        borderColor="var(--border-subtle)"
        rounded="2xl"
        pl={5}
        pr={1.5}
        py={1.5}
        _focusWithin={{ borderColor: 'var(--accent)', boxShadow: '0 0 0 1px rgba(var(--accent-rgb),0.2)' }}
        transition="all 0.2s ease"
      >
        <Brain size={16} color="var(--text-dim)" style={{ flexShrink: 0 }} />
        <input
          placeholder="What do you want to learn?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleClick(); }}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: '14px', height: '36px',
            width: '100%', caretColor: 'var(--accent)',
          }}
        />
        <IconButton
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Settings"
          size="sm"
          rounded="full"
          variant="ghost"
          color="var(--text-muted)"
          _hover={{ color: 'var(--accent)' }}
          w={8} h={8} minW={8}
        >
          <Settings size={14} />
        </IconButton>
        <IconButton
          onClick={handleClick}
          aria-label="Create course"
          disabled={loading}
          size="sm"
          rounded="full"
          bg={topic.trim() ? 'linear-gradient(135deg, var(--accent), var(--blue))' : 'var(--border-subtle)'}
          color={topic.trim() ? 'white' : 'gray.600'}
          _hover={{ opacity: 0.85 }}
          transition="all 0.15s ease"
          w={8} h={8} minW={8}
        >
          {loading ? <Spinner size="xs" /> : <Send size={14} />}
        </IconButton>
      </Flex>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            overflow="hidden"
          >
            <Box
              mt={2}
              p={4}
              bg="var(--bg-elevated)"
              border="1px solid"
              borderColor="var(--border-subtle)"
              borderRadius="xl"
            >
              <Stack gap={3}>
                {/* Level */}
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="var(--text-secondary)" mb={1}>Level</Text>
                  <select value={level} onChange={(e) => setLevel(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid var(--border-base, #d0d5dd)', background: 'transparent', color: 'var(--text-primary, #1a1a1a)' }}>
                    {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Box>

                {/* Style */}
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="var(--text-secondary)" mb={1}>Style</Text>
                  <Flex gap={1.5} flexWrap="wrap">
                    {STYLE_OPTIONS.map(o => (
                      <button key={o.value}
                        onClick={() => setStyle(o.value)}
                        style={{
                          padding: '5px 12px', fontSize: '12px', fontWeight: style === o.value ? '600' : '400',
                          borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease',
                          border: style === o.value ? '1.5px solid var(--accent, #3182ce)' : '1.5px solid var(--border-base, #d0d5dd)',
                          background: style === o.value ? 'var(--accent, #3182ce)' : 'transparent',
                          color: style === o.value ? '#fff' : 'var(--text-primary, #1a1a1a)',
                        }}
                      >{o.label}</button>
                    ))}
                  </Flex>
                </Box>

                {/* Known topics + Goal */}
                <Flex gap={3}>
                  <Box flex={1}>
                    <Text fontSize="xs" fontWeight="600" color="var(--text-secondary)" mb={1}>Already know</Text>
                    <input placeholder="Docker, Linux, REST APIs"
                      value={knownTopics} onChange={(e) => setKnownTopics(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid var(--border-base, #d0d5dd)', background: 'transparent', color: 'var(--text-primary, #1a1a1a)' }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="xs" fontWeight="600" color="var(--text-secondary)" mb={1}>Goal</Text>
                    <input placeholder="Deploy microservices"
                      value={learningGoal} onChange={(e) => setLearningGoal(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid var(--border-base, #d0d5dd)', background: 'transparent', color: 'var(--text-primary, #1a1a1a)' }}
                    />
                  </Box>
                </Flex>
              </Stack>
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Live generation view */}
      {showGeneration && (
        <Box mt={3}>
          <RLMGenerationView events={events} isComplete={isComplete} error={error} />
        </Box>
      )}
    </Box>
  );
}

function EmptyElement() {
  const baseURL = import.meta.env.VITE_API_URL;
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/courses/myCourses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(Array.isArray(res.data) ? res.data : res.data.courses || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const userName = user?.name || user?.nickname || user?.email?.split('@')[0];

  return (
    <Box minH="full" px={{ base: 4, md: 8 }} py={10} position="relative">
      {/* Subtle background glow */}
      <Box
        position="absolute"
        top="-20%"
        left="50%"
        transform="translateX(-50%)"
        w="600px"
        h="400px"
        borderRadius="50%"
        bg="rgba(var(--accent-rgb),0.04)"
        filter="blur(100px)"
        pointerEvents="none"
      />

      <Box maxW="7xl" mx="auto" position="relative" zIndex={1}>
        {/* Hero greeting */}
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={stagger}
          textAlign="center"
          mb={10}
        >
          <MotionBox variants={fadeUp} custom={0}>
            <Text fontSize="sm" color="var(--text-muted)" mb={2}>
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
            </Text>
          </MotionBox>

          <MotionBox variants={fadeUp} custom={1}>
            <Heading
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="800"
              color="var(--text-primary)"
              letterSpacing="-0.02em"
            >
              {userName ? `Welcome back, ${userName}` : 'Welcome to '}
              {!userName && (
                <Text as="span" color="var(--accent)">Mind Palace</Text>
              )}
            </Heading>
          </MotionBox>

          <MotionBox variants={fadeUp} custom={2}>
            <Text fontSize="md" color="var(--text-secondary)" mt={3} maxW="500px" mx="auto">
              Create AI-powered courses in seconds. Just type a topic below.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* Course creator */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          mb={12}
        >
          <MiniCourseCreator onCourseGenerated={fetchCourses} />
        </MotionBox>

        {/* Courses section */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {courses.length > 0 && (
            <Flex align="center" justify="space-between" mb={6}>
              <Flex align="center" gap={2}>
                <BookOpen size={18} color="var(--accent)" />
                <Text fontSize="lg" fontWeight="semibold" color="var(--text-primary)">
                  Your Courses
                </Text>
                <Text fontSize="sm" color="var(--text-muted)">
                  ({courses.length})
                </Text>
              </Flex>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: '1.5px solid var(--border-base, #d0d5dd)', background: 'transparent', color: 'var(--text-primary, #1a1a1a)', cursor: 'pointer' }}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
            </Flex>
          )}

          {loading ? (
            <VStack py={12}>
              <Spinner size="md" color="var(--accent)" />
              <Text fontSize="sm" color="var(--text-muted)">Loading courses...</Text>
            </VStack>
          ) : courses.length === 0 ? (
            <VStack py={16} gap={4}>
              <Box
                w={16}
                h={16}
                rounded="2xl"
                bg="rgba(var(--accent-rgb),0.08)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Zap size={28} color="var(--accent)" />
              </Box>
              <Text fontSize="md" color="var(--text-secondary)" textAlign="center">
                No courses yet. Create your first one above!
              </Text>
            </VStack>
          ) : (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              gap={5}
            >
              {[...courses].sort((a, b) => {
                const toDate = (c) => {
                  if (Array.isArray(c)) { const [y,m,d,...r] = c; return new Date(y, (m||1)-1, d||1, ...(r||[])); }
                  return new Date(c || 0);
                };
                const dateA = toDate(a.createdAt);
                const dateB = toDate(b.createdAt);
                if (sortBy === 'newest') return dateB - dateA;
                if (sortBy === 'oldest') return dateA - dateB;
                if (sortBy === 'az') return (a.title || '').localeCompare(b.title || '');
                if (sortBy === 'za') return (b.title || '').localeCompare(a.title || '');
                return 0;
              }).map((course, i) => (
                <MotionBox
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <CourseCard course={course} />
                </MotionBox>
              ))}
            </SimpleGrid>
          )}
        </MotionBox>
      </Box>
    </Box>
  );
}

export default EmptyElement;
