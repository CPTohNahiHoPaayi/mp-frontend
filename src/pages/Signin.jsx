import {
  Box,
  Button,
  Center,
  Flex,
  Input,
  Stack,
  Text,
  HStack,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authBg from '@/assets/auth-bg.png';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const slideIn = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

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
    window.location.href = authUrl;
  };

  return (
    <Box
      minH="100vh"
      bg="var(--bg-base)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Background orbs */}
      <MotionBox
        position="absolute"
        w="500px"
        h="500px"
        borderRadius="50%"
        bg="rgba(var(--blue-rgb),0.08)"
        filter="blur(100px)"
        top="-10%"
        right="-10%"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <MotionBox
        position="absolute"
        w="400px"
        h="400px"
        borderRadius="50%"
        bg="rgba(var(--accent-rgb),0.06)"
        filter="blur(100px)"
        bottom="-10%"
        left="-5%"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Back to home */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        position="absolute"
        top={6}
        left={6}
        zIndex={10}
      >
        <Button
          variant="ghost"
          size="sm"
          color="var(--text-muted)"
          _hover={{ color: 'var(--text-primary)', bg: 'var(--bg-hover)' }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          <Text ml={2}>Back</Text>
        </Button>
      </MotionBox>

      {/* Main card */}
      <MotionFlex
        initial="hidden"
        animate="visible"
        w="full"
        maxW="5xl"
        mx={4}
        rounded="2xl"
        overflow="hidden"
        border="1px solid"
        borderColor="var(--border-light)"
        boxShadow="0 25px 60px rgba(0,0,0,0.5)"
        bg="var(--bg-elevated)"
        backdropFilter="blur(20px)"
      >
        {/* Left — Form */}
        <MotionBox
          variants={slideIn}
          flex="1"
          p={{ base: 8, md: 12 }}
          display="flex"
          alignItems="center"
        >
          <Stack gap={7} w="full" maxW="sm" mx="auto">
            {/* Logo */}
            <MotionBox variants={fadeUp} custom={0}>
              <HStack gap={2} mb={2}>
                <Box
                  w={8}
                  h={8}
                  rounded="lg"
                  bg="linear-gradient(135deg, var(--accent), var(--blue))"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <BookOpen size={18} color="var(--text-primary)" />
                </Box>
                <Text fontSize="lg" fontWeight="bold" color="var(--text-primary)">
                  Text<Box as="span" color="var(--accent)">ToLearn</Box>
                </Text>
              </HStack>
            </MotionBox>

            {/* Heading */}
            <MotionBox variants={fadeUp} custom={1}>
              <Text fontSize="sm" color="var(--text-muted)" mb={1}>
                Welcome back
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="var(--text-primary)">
                Sign in to your account
              </Text>
            </MotionBox>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <MotionBox variants={fadeUp} custom={2}>
                  <Text mb={1.5} fontSize="sm" color="var(--text-secondary)">
                    Email
                  </Text>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="var(--bg-input)"
                    border="1px solid"
                    borderColor="var(--border-light)"
                    color="var(--text-primary)"
                    rounded="xl"
                    h={12}
                    _placeholder={{ color: 'var(--text-dim)' }}
                    _hover={{ borderColor: 'var(--border-hover)' }}
                    _focus={{ borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)' }}
                  />
                </MotionBox>

                <MotionBox variants={fadeUp} custom={3}>
                  <Text mb={1.5} fontSize="sm" color="var(--text-secondary)">
                    Password
                  </Text>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="var(--bg-input)"
                    border="1px solid"
                    borderColor="var(--border-light)"
                    color="var(--text-primary)"
                    rounded="xl"
                    h={12}
                    _placeholder={{ color: 'var(--text-dim)' }}
                    _hover={{ borderColor: 'var(--border-hover)' }}
                    _focus={{ borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)' }}
                  />
                </MotionBox>

                {error && (
                  <MotionBox variants={fadeUp} custom={4}>
                    <Text color="red.400" fontSize="sm">{error}</Text>
                  </MotionBox>
                )}

                <MotionBox variants={fadeUp} custom={4}>
                  <Button
                    type="submit"
                    w="full"
                    h={12}
                    bg="linear-gradient(135deg, var(--accent) 0%, var(--blue) 100%)"
                    color="var(--text-primary)"
                    fontWeight="semibold"
                    rounded="xl"
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(var(--accent-rgb),0.25)',
                    }}
                    transition="all 0.2s ease"
                  >
                    Sign In / Sign Up
                  </Button>
                </MotionBox>
              </Stack>
            </form>

            {/* Divider */}
            <MotionBox variants={fadeUp} custom={5}>
              <Flex align="center">
                <Box flex="1" h="1px" bg="var(--border-light)" />
                <Text px={3} color="var(--text-dim)" fontSize="xs">
                  or continue with
                </Text>
                <Box flex="1" h="1px" bg="var(--border-light)" />
              </Flex>
            </MotionBox>

            {/* Google */}
            <MotionBox variants={fadeUp} custom={6}>
              <Button
                onClick={handleGoogleLogin}
                w="full"
                h={12}
                bg="var(--bg-input)"
                border="1px solid"
                borderColor="var(--border-light)"
                color="var(--text-body)"
                rounded="xl"
                fontWeight="medium"
                _hover={{
                  bg: 'var(--bg-hover)',
                  borderColor: 'var(--border-hover)',
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.2s ease"
              >
                <FcGoogle size={20} />
                <Text ml={3}>Continue with Google</Text>
              </Button>
            </MotionBox>
          </Stack>
        </MotionBox>

        {/* Right — Image */}
        <MotionBox
          variants={scaleIn}
          flex="1"
          display={{ base: 'none', md: 'block' }}
          position="relative"
          overflow="hidden"
        >
          <img
            src={authBg}
            alt="Learning"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {/* Overlay with text */}
          <Box
            position="absolute"
            inset={0}
            bg="linear-gradient(135deg, rgba(6,8,15,0.6), rgba(var(--accent-rgb),0.1))"
          />
          <Box
            position="absolute"
            bottom={10}
            left={8}
            right={8}
          >
            <Text
              fontSize="lg"
              fontWeight="medium"
              color="var(--text-primary)"
              fontStyle="italic"
              lineHeight="1.6"
            >
              "With great power comes great responsibility"
            </Text>
            <Text fontSize="sm" color="var(--text-secondary)" mt={2}>
              Learn smart. Build fast. Ship today.
            </Text>
          </Box>
        </MotionBox>
      </MotionFlex>
    </Box>
  );
};
