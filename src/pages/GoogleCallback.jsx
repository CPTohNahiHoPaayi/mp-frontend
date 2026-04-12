import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import {
  Center,
  Spinner,
  Text,
  VStack,
  Heading,
} from '@chakra-ui/react';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/auth/google/callback?code=${code}`)
        .then((res) => {
          const { token, userInfo } = res.data;
          login(token, userInfo);
          navigate('/');
        })
        .catch((err) => {
          console.error('Google login failed:', err);
          navigate('/signin');
        });
    }
  }, []);


  return (
    <Center minH="100vh" bg="var(--bg-base)" px={4} color="var(--text-primary)">
      <VStack spacing={4} textAlign="center">
        <Spinner size="xl" thickness="4px" color="blue.400" />
        <Heading size="md">Signing you in with Google...</Heading>
        <Text fontSize="sm" color="var(--text-secondary)">
          Please wait while we authenticate your account.
        </Text>
      </VStack>
    </Center>
  );
}
