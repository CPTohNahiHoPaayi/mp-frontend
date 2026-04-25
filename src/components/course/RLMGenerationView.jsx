import React, { useState, useRef, useEffect } from 'react';
import { Box, Text, Stack, Badge, Progress, Code } from '@chakra-ui/react';
import { Brain, Zap, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

function RLMGenerationView({ events, isComplete, error }) {
  const [expandedSections, setExpandedSections] = useState({ code: false, output: false });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const latestIteration = events.filter(e => e.event === 'iteration').slice(-1)[0];
  const subCalls = events.filter(e => e.event === 'sub_llm_call').length;
  const codeEvents = events.filter(e => e.event === 'code');
  const outputEvents = events.filter(e => e.event === 'output');
  const latestCode = codeEvents.slice(-1)[0];
  const latestOutput = outputEvents.slice(-1)[0];

  const currentStep = latestIteration?.data?.iteration || 0;
  const maxSteps = latestIteration?.data?.max || 15;
  const progressPercent = isComplete ? 100 : Math.round((currentStep / maxSteps) * 100);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusLabel = () => {
    if (isComplete) return 'Course Generated!';
    if (error) return 'Error occurred';
    if (!latestIteration) return 'Starting...';
    const lastEvent = events[events.length - 1];
    if (lastEvent?.event === 'sub_llm_call') return 'Calling sub-LLM...';
    if (lastEvent?.event === 'code') return 'Agent writing code...';
    if (lastEvent?.event === 'output') return 'Executing in REPL...';
    return `Iteration ${currentStep}/${maxSteps}`;
  };

  return (
    <Box
      bg="var(--bg-secondary)"
      borderRadius="lg"
      border="1px solid"
      borderColor="var(--border-base)"
      overflow="hidden"
    >
      {/* Header */}
      <Box p={3} bg="var(--bg-tertiary)" borderBottom="1px solid" borderColor="var(--border-base)">
        <Stack direction="row" align="center" justify="space-between">
          <Stack direction="row" align="center" gap={2}>
            <Brain size={16} color={isComplete ? '#48bb78' : '#63b3ed'} />
            <Text fontSize="sm" fontWeight="bold" color="var(--text-primary)">
              RLM Agent
            </Text>
            <Badge
              colorScheme={isComplete ? 'green' : error ? 'red' : 'blue'}
              fontSize="xs"
              variant="subtle"
            >
              {getStatusLabel()}
            </Badge>
          </Stack>
          <Stack direction="row" gap={2}>
            <Badge variant="outline" fontSize="xs">Step {currentStep}/{maxSteps}</Badge>
            <Badge variant="outline" fontSize="xs">
              <Zap size={10} style={{ display: 'inline', marginRight: 2 }} />
              {subCalls} sub-LLM calls
            </Badge>
          </Stack>
        </Stack>

        <Progress.Root value={progressPercent} size="xs" mt={2} colorPalette={isComplete ? 'green' : 'blue'}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Box>

      {/* Event Log */}
      <Box maxH="400px" overflowY="auto" p={3}>
        <Stack gap={2}>
          {events.map((evt, idx) => (
            <EventItem key={idx} event={evt} />
          ))}

          {error && (
            <Stack direction="row" align="center" gap={2} p={2} bg="red.900" borderRadius="md">
              <AlertCircle size={14} color="#fc8181" />
              <Text fontSize="xs" color="red.200">{error}</Text>
            </Stack>
          )}

          {isComplete && (
            <Stack direction="row" align="center" gap={2} p={2} bg="green.900" borderRadius="md">
              <CheckCircle size={14} color="#48bb78" />
              <Text fontSize="xs" color="green.200">Course generation complete!</Text>
            </Stack>
          )}

          <div ref={bottomRef} />
        </Stack>
      </Box>

      {/* Expandable Code Panel */}
      {latestCode && (
        <Box borderTop="1px solid" borderColor="var(--border-base)">
          <Box
            p={2}
            cursor="pointer"
            onClick={() => toggleSection('code')}
            _hover={{ bg: 'var(--bg-tertiary)' }}
          >
            <Stack direction="row" align="center" justify="space-between">
              <Text fontSize="xs" fontWeight="bold" color="var(--text-secondary)">
                Latest Agent Code
              </Text>
              {expandedSections.code ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Stack>
          </Box>
          {expandedSections.code && (
            <Box p={2} bg="var(--bg-tertiary)" maxH="200px" overflowY="auto">
              <Code display="block" whiteSpace="pre-wrap" fontSize="xs" p={2} bg="gray.900" color="green.300" borderRadius="md">
                {latestCode.data.code}
              </Code>
            </Box>
          )}
        </Box>
      )}

      {/* Expandable Output Panel */}
      {latestOutput && (
        <Box borderTop="1px solid" borderColor="var(--border-base)">
          <Box
            p={2}
            cursor="pointer"
            onClick={() => toggleSection('output')}
            _hover={{ bg: 'var(--bg-tertiary)' }}
          >
            <Stack direction="row" align="center" justify="space-between">
              <Text fontSize="xs" fontWeight="bold" color="var(--text-secondary)">
                Latest REPL Output
              </Text>
              {expandedSections.output ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Stack>
          </Box>
          {expandedSections.output && (
            <Box p={2} bg="var(--bg-tertiary)" maxH="200px" overflowY="auto">
              <Code display="block" whiteSpace="pre-wrap" fontSize="xs" p={2} bg="gray.900" color="gray.300" borderRadius="md">
                {latestOutput.data.output}
              </Code>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function EventItem({ event }) {
  const { event: type, data } = event;

  const styles = {
    iteration: { icon: '🔄', color: 'blue.300', label: `Iteration ${data.iteration}/${data.max}` },
    code: { icon: '📝', color: 'green.300', label: `Agent wrote code (${data.code?.split('\n').length || 0} lines)` },
    output: { icon: '📤', color: 'gray.300', label: `REPL output (${data.output?.length || 0} chars)` },
    sub_llm_call: { icon: '🧠', color: 'purple.300', label: `Sub-LLM call #${data.call_number}: ${data.query?.slice(0, 60)}...` },
    sub_llm_result: { icon: '✨', color: 'purple.200', label: `Sub-LLM #${data.call_number} returned (${data.result?.length || 0} chars)` },
    error: { icon: '❌', color: 'red.300', label: data.message },
    complete: { icon: '✅', color: 'green.300', label: `Complete! ${data.iterations} iterations, ${data.sub_calls} sub-LLM calls` },
  };

  const s = styles[type] || { icon: '•', color: 'gray.400', label: type };

  return (
    <Text fontSize="xs" color={s.color} lineHeight="tall">
      {s.icon} {s.label}
    </Text>
  );
}

export default RLMGenerationView;
