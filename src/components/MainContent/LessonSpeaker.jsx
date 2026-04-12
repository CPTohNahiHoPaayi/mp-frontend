import { Button, Spinner, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const LessonSpeaker = ({ lesson }) => {
  const baseURL = import.meta.env.VITE_TTS_URL;
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSpeak = async () => {
    if (audioUrl) {
      setAudioUrl(null);
      return;
    }

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
      const url = URL.createObjectURL(res.data);
      setAudioUrl(url);
    } catch (err) {
      console.error('Failed to fetch audio:', err);
    } finally {
      setLoading(false);
    }
  };

  if (audioUrl) {
    return (
      <audio
        src={audioUrl}
        controls
        autoPlay
        preload="auto"
        style={{ height: '32px', maxWidth: '200px' }}
      />
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      color="gray.400"
      _hover={{ color: 'white', bg: 'whiteAlpha.50' }}
      rounded="lg"
      h={9}
      px={3}
      onClick={handleSpeak}
      disabled={loading}
    >
      {loading ? <Spinner size="xs" /> : <Volume2 size={16} />}
      <Text ml={1.5} fontSize="xs" display={{ base: 'none', sm: 'block' }}>
        {loading ? 'Generating...' : 'Listen'}
      </Text>
    </Button>
  );
};

export default LessonSpeaker;
