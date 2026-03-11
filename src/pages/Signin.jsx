import {
  Box,
  Button,
  Center,
  Flex,
  Input,
  Link,
  Stack,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export const Signin = () => {
  const { loginWithCredentials, loginWithToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    if (token) {
      loginWithToken(token);
      navigate('/');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginWithCredentials(email, password);
    } catch {
      setError('Invalid credentials');
    }
  };

  const handleGoogleLogin = () => {
    const clientId = '972601767507-ddad99bsvtbv889o9bsr9mj8qgp59ef4.apps.googleusercontent.com';
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const scope = 'openid email profile';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    console.log(redirectUri);
    window.location.href = authUrl;
  };


  return (



    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #D00000 0%, #0047AB 100%)"

      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        w="full"
        maxW="6xl"
        bg="white"
        rounded="lg"
        overflow="hidden"
        boxShadow="2xl"
      >
        <Text
          position="absolute"
          top="6"
          left="50%"
          transform="translateX(-50%)"
          fontSize="xl"
          fontWeight="medium"
          color="whiteAlpha.900"
          fontStyle="italic"
          textAlign="center"
          px={4}
        >
          "With great power comes great responsibility"
        </Text>
        {/* Left Side - Form */}
        <Box flex="1" p={10} bg="blue.900" color="white">
          <Center h="100%">
            <Stack spacing={8} w="full" maxW="md">
              <Box flex="1">
                <Text fontSize="2xl" color="gray.300">
                  Welcome Back
                </Text>
                <Text fontSize="3xl" fontWeight="bold">
                  Sign In to{' '}
                  <Text as="span" color="blue.400">
                    TextToLearn
                  </Text>
                </Text>
              </Box>

              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <Box>
                    <Text mb={1} fontSize="sm" color="gray.400">
                      Email
                    </Text>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      bg="white"
                      borderColor="gray.700"
                      _placeholder={{ color: 'gray.500' }}
                      color="black"
                    />
                  </Box>

                  <Box>
                    <Text mb={1} fontSize="sm" color="gray.400">
                      Password
                    </Text>
                    <Input
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      bg="white"
                      borderColor="gray.700"
                      _placeholder={{ color: 'gray.500' }}
                      color="black"
                    />
                  </Box>

                  {error && <Text color="red.400">{error}</Text>}

                  <Button
                    type="submit"
                    bg="blue.500"
                    size="lg"
                    fontWeight="medium"
                  >
                    Sign In / Sign Up
                  </Button>
                </Stack>
              </form>

              <Flex align="center" my={4}>
                <Box flex="1" h="1px" bg="gray.300" />
                <Text px={3} color="white" fontSize="sm" whiteSpace="nowrap">
                  or sign in with
                </Text>
                <Box flex="1" h="1px" bg="gray.300" />
              </Flex>


              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                borderColor="gray.300"
                color="gray.700"
                bg="white"
                size="lg"

                _hover={{ bg: "gray.300" }}
                _active={{ bg: "gray.200" }}
                fontWeight="medium"
                borderRadius="md"
                w="full"
              >
                <FcGoogle size={20} />
                Log in with Google
              </Button>

            </Stack>
          </Center>
        </Box>

        {/* Right Side - Image */}
        <Box flex="1" display={{ base: 'none', md: 'block' }}>
          <img
            src="src/assets/auth-bg.png"
            alt="signin background"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      </Flex>
      {/* <Text
        position="absolute"
        bottom="6"
        left="50%"
        transform="translateX(-50%)"
        fontSize="md"
        fontWeight="normal"
        color="whiteAlpha.800"
        fontStyle="italic"
        textAlign="center"
        px={6}
        maxW="3xl"
      >
        “You won’t, it’s a leap of faith. That’s all it is, a leap of faith.”
      </Text> */}
    </Box>

  );
};
