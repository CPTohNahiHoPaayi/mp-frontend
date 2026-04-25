"use client"

import React, { useState, useRef } from 'react';
import {
  Box,
  Stack,
  Input,
  Button,
  Spinner,
  Text,
  Heading,
} from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { Sparkles, Brain } from 'lucide-react';
import RLMGenerationView from '@/components/course/RLMGenerationView';

const LEVEL_OPTIONS = [
  { value: 0, label: 'Absolute Beginner' },
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
  { value: 4, label: 'Expert / Refresher' },
];

const STYLE_OPTIONS = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'hands_on', label: 'Hands-On' },
  { value: 'visual', label: 'Visual' },
  { value: 'conceptual', label: 'Conceptual' },
  { value: 'example_driven', label: 'Example-Driven' },
];

const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
];

function MiniCourseCreator({ onCourseGenerated }) {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState(2);
  const [style, setStyle] = useState('balanced');
  const [duration, setDuration] = useState(60);
  const [knownTopics, setKnownTopics] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  const [events, setEvents] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const eventSourceRef = useRef(null);

  const rlmUrl = import.meta.env.VITE_RLM_URL || 'http://localhost:9000';

  const handleGenerate = () => {
    if (!topic.trim()) {
      toaster.create({ description: 'Topic is required.', type: 'warning' });
      return;
    }

    setLoading(true);
    setShowGeneration(true);
    setEvents([]);
    setIsComplete(false);
    setError(null);
    setGeneratedCourse(null);

    const body = JSON.stringify({
      topic: topic.trim(),
      preferences: {
        level,
        duration_minutes: duration,
        style,
        known_topics: knownTopics.split(',').map(s => s.trim()).filter(Boolean),
        learning_goal: learningGoal.trim(),
        include_web_resources: false,
      },
    });

    // Use fetch + ReadableStream for SSE (EventSource doesn't support POST)
    fetch(`${rlmUrl}/api/rlm/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
      .then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              setLoading(false);
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // keep incomplete line in buffer

            let eventType = null;
            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith('data: ') && eventType) {
                try {
                  const data = JSON.parse(line.slice(6));
                  const evt = { event: eventType, data };
                  setEvents(prev => [...prev, evt]);

                  if (eventType === 'complete') {
                    setIsComplete(true);
                    setLoading(false);
                    try {
                      const course = JSON.parse(data.course);
                      setGeneratedCourse(course);
                      toaster.create({ description: 'Course generated!', type: 'success' });
                      if (onCourseGenerated) onCourseGenerated(course);
                    } catch {
                      setGeneratedCourse(null);
                    }
                  }

                  if (eventType === 'error') {
                    setError(data.message);
                  }
                } catch {
                  // skip malformed JSON
                }
                eventType = null;
              }
            }

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

  const handleCancel = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setLoading(false);
    setShowGeneration(false);
  };

  return (
    <Box mt={4}>
      <Box
        p={4}
        bg="ghost"
        borderRadius="lg"
        boxShadow="sm"
        borderColor="var(--border-base)"
      >
        <Stack spacing={3}>
          <Heading
            as="h4"
            size="lg"
            color="blue.400"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Brain size={18} />
            RLM Course Generator
          </Heading>

          <Text fontSize="xs" color="var(--text-secondary)">
            AI agent recursively builds your personalized course
          </Text>

          {/* Topic */}
          <Input
            placeholder="Course topic (e.g. Python REST APIs with Flask)"
            size="sm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            bg="ghost"
            color="var(--text-primary)"
            borderColor="var(--border-base)"
            _placeholder={{ color: 'var(--text-secondary)' }}
          />

          {/* Level + Duration row */}
          <Stack direction="row" gap={2}>
            <Box flex={1}>
              <Text fontSize="xs" color="var(--text-secondary)" mb={1}>Level</Text>
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: '12px',
                  borderRadius: '6px', border: '1px solid var(--border-base)',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                }}
              >
                {LEVEL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Box>
            <Box flex={1}>
              <Text fontSize="xs" color="var(--text-secondary)" mb={1}>Duration</Text>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: '12px',
                  borderRadius: '6px', border: '1px solid var(--border-base)',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                }}
              >
                {DURATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Box>
          </Stack>

          {/* Style */}
          <Box>
            <Text fontSize="xs" color="var(--text-secondary)" mb={1}>Learning Style</Text>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {STYLE_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  size="xs"
                  variant={style === opt.value ? 'solid' : 'outline'}
                  colorScheme={style === opt.value ? 'blue' : 'gray'}
                  onClick={() => setStyle(opt.value)}
                  fontSize="xs"
                >
                  {opt.label}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Known Topics */}
          <Input
            placeholder="Known topics (comma-separated, e.g. HTML, CSS)"
            size="sm"
            value={knownTopics}
            onChange={(e) => setKnownTopics(e.target.value)}
            bg="ghost"
            color="var(--text-primary)"
            borderColor="var(--border-base)"
            _placeholder={{ color: 'var(--text-secondary)' }}
          />

          {/* Learning Goal */}
          <Input
            placeholder="Learning goal (e.g. Build production REST APIs)"
            size="sm"
            value={learningGoal}
            onChange={(e) => setLearningGoal(e.target.value)}
            bg="ghost"
            color="var(--text-primary)"
            borderColor="var(--border-base)"
            _placeholder={{ color: 'var(--text-secondary)' }}
          />

          {/* Generate / Cancel */}
          <Stack direction="row" gap={2}>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleGenerate}
              disabled={loading}
              flex={1}
            >
              {loading ? <Spinner size="sm" /> : <><Sparkles size={14} style={{ marginRight: 4 }} /> Generate</>}
            </Button>
            {loading && (
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Live Generation View */}
      {showGeneration && (
        <Box mt={3}>
          <RLMGenerationView
            events={events}
            isComplete={isComplete}
            error={error}
          />
        </Box>
      )}

      {/* Quick Course Summary after completion */}
      {generatedCourse && (
        <Box mt={3} p={3} bg="green.900" borderRadius="lg" border="1px solid" borderColor="green.700">
          <Text fontSize="sm" fontWeight="bold" color="green.200">
            {generatedCourse.title}
          </Text>
          <Text fontSize="xs" color="green.300" mt={1}>
            {generatedCourse.modules?.length || 0} modules,{' '}
            {generatedCourse.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0} lessons,{' '}
            ~{generatedCourse.estimated_minutes || '?'} min
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default MiniCourseCreator;
