import React, { useEffect, useState } from 'react';
import {
  Box,
  AspectRatio,
  Text,
  VStack,
  Spinner,
  Heading,
} from '@chakra-ui/react';
import axios from 'axios';

const VideoBlock = ({ query }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  // console.log(apiKey);
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 2,
            key: apiKey,
          },
        });
        // console.log(response);
        const items = response.data.items || [];
        const videoData = items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
        }));
        setVideos(videoData);
      } catch (error) {
        console.error('❌ Failed to fetch videos:', error.message);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchVideos();
  }, [query, apiKey]);

  if (loading) {
    return (
      <Box w="full" py={8} textAlign="center">
        <Spinner size="lg" color="blue.400" />
      </Box>
    );
  }

  if (!videos.length) {
    return (
      <Box w="full" py={8} textAlign="center" color="gray.400">
        <Text>No relevant videos found for: "{query}"</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="100%" mt={6}>
      {/* <Heading size="md" color="gray.100" mb={2}>
        Related Videos: {query}
      </Heading> */}
      {videos.map((video) => (
        <Box key={video.videoId}>
          <Text mt={2} fontWeight="semibold" fontSize="xl" color="gray.200">
            {video.title}
          </Text>
          <AspectRatio ratio={16 / 9} w="100%">
            <iframe
              src={`https://www.youtube.com/embed/${video.videoId}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              style={{ border: 0 }}
            />
          </AspectRatio>

        </Box>
      ))}
    </VStack>
  );
};

export default VideoBlock;
