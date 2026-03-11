import {
    Button,
    HStack,
    Spinner,
    Box,
  } from '@chakra-ui/react';
  import { useState } from 'react';
  import axios from 'axios';
  import { useAuth } from '@/context/AuthContext';
  
  const LessonSpeaker = ({ lesson }) => {
    const baseURL = import.meta.env.VITE_TTS_URL;
    const [audioUrl, setAudioUrl] = useState(null);
    const [loading, setLoading] = useState(false);


    const {token} =useAuth();
  
    const handleSpeak = async () => {
      if (!lesson || !lesson.content) return;
  
      const combinedText = lesson.content
        .filter(block => block.type === 'heading' || block.type === 'paragraph')
        .map(block => block.text)
        .join('\n');
  
      try {
        setLoading(true);
        
        const res = await axios.post(
          `${baseURL}/node/tts/tts`,
          { text: combinedText },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
          }
        );
  
        const blob = res.data;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (err) {
        console.error('❌ Failed to fetch audio:', err);
        alert('Audio generation failed');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Box w="100%">
        <HStack spacing={4} flexWrap="wrap">
          <Button
            colorScheme="yellow"
            borderRadius="xl"
            onClick={handleSpeak}
            isDisabled={loading}
            
          > {loading ? <Spinner size="md" /> : undefined}
            {loading ? 'Generating audio...(this takes a minute or 2)' : 'Explain this Lesson'}
          </Button>
  
          {audioUrl && (
            <Box flex="1" minW="250px">
              <audio
                src={audioUrl}
                controls
                preload="auto"
                style={{ width: '100%' }}
              />
            </Box>
          )}
        </HStack>
      </Box>
    );
  };
  
  export default LessonSpeaker;
  