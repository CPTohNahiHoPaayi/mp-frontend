import React, { useEffect, useState } from 'react';
import { Box, Flex, Text, Button, HStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, Brain, Zap, Code, Sparkles, ArrowRight } from 'lucide-react';
import landingImg from '@/assets/landinPagePng.png';

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionFlex = motion(Flex);

const floatingOrb = (delay, x, y, size, color) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  bg: color,
  filter: 'blur(80px)',
  opacity: 0.4,
  top: y,
  left: x,
  animate: {
    y: [0, -30, 0, 30, 0],
    x: [0, 20, 0, -20, 0],
    scale: [1, 1.1, 1, 0.9, 1],
  },
  transition: {
    duration: 8,
    repeat: Infinity,
    delay,
    ease: 'easeInOut',
  },
});

const features = [
  { icon: Brain, label: 'AI-Powered Courses', desc: 'Generate full courses on any topic in seconds' },
  { icon: Code, label: 'Smart Notes + RAG', desc: 'Ask questions about your notes with AI retrieval' },
  { icon: Zap, label: 'Instant Quizzes', desc: 'Test your knowledge with auto-generated MCQs' },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

function GridPattern() {
  return (
    <Box
      position="absolute"
      inset={0}
      opacity={0.03}
      backgroundImage="linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)"
      backgroundSize="60px 60px"
      pointerEvents="none"
    />
  );
}

function FeatureCard({ icon: Icon, label, desc, index }) {
  return (
    <MotionBox
      variants={fadeUp}
      bg="var(--bg-elevated)"
      border="1px solid"
      borderColor="var(--border-light)"
      rounded="2xl"
      p={6}
      backdropFilter="blur(10px)"
      _hover={{
        borderColor: 'var(--border-hover)',
        bg: 'var(--bg-hover)',
        transform: 'translateY(-4px)',
      }}
      transition="all 0.3s ease"
      cursor="default"
    >
      <Box
        w={12}
        h={12}
        rounded="xl"
        bg="linear-gradient(135deg, rgba(var(--accent-rgb),0.2), rgba(var(--blue-rgb),0.2))"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={4}
      >
        <Icon size={24} color="var(--accent)" />
      </Box>
      <Text fontSize="lg" fontWeight="semibold" color="var(--text-primary)" mb={2}>
        {label}
      </Text>
      <Text fontSize="sm" color="var(--text-secondary)" lineHeight="1.6">
        {desc}
      </Text>
    </MotionBox>
  );
}

function TypewriterText({ text, delay = 0 }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <Text
      as="span"
      bg="linear-gradient(135deg, var(--accent) 0%, var(--blue) 100%)"
      bgClip="text"
      fontWeight="extrabold"
    >
      {displayed}
      <MotionBox
        as="span"
        display="inline-block"
        w="3px"
        h="1em"
        bg="var(--accent)"
        ml={1}
        verticalAlign="text-bottom"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </Text>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      bg="var(--bg-base)"
      color="var(--text-primary)"
      overflowX="hidden"
      position="relative"
    >
      {/* Background effects */}
      <GridPattern />
      <MotionBox {...floatingOrb(0, '10%', '20%', '400px', 'rgba(var(--blue-rgb),0.15)')} />
      <MotionBox {...floatingOrb(2, '70%', '10%', '350px', 'rgba(var(--accent-rgb),0.12)')} />
      <MotionBox {...floatingOrb(4, '50%', '60%', '300px', 'rgba(var(--purple-rgb),0.1)')} />

      {/* Navbar */}
      <MotionFlex
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        px={{ base: 6, md: 10 }}
        py={5}
        align="center"
        justify="space-between"
        position="relative"
        zIndex={10}
      >
        <HStack gap={2}>
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
          <Text fontSize="xl" fontWeight="bold" letterSpacing="tight">
            Text<Box as="span" color="var(--accent)">ToLearn</Box>
          </Text>
        </HStack>
        <Button
          size="sm"
          variant="ghost"
          color="var(--text-body)"
          _hover={{ color: 'var(--text-primary)', bg: 'var(--border-light)' }}
          onClick={() => navigate('/signin')}
        >
          Sign In
        </Button>
      </MotionFlex>

      {/* Hero Section */}
      <MotionFlex
        variants={stagger}
        initial="hidden"
        animate="visible"
        direction={{ base: 'column', lg: 'row' }}
        align="center"
        justify="space-between"
        px={{ base: 6, md: 12, lg: 20 }}
        pt={{ base: 12, md: 20 }}
        pb={{ base: 16, md: 24 }}
        maxW="8xl"
        mx="auto"
        position="relative"
        zIndex={5}
        gap={12}
      >
        {/* Left — Copy */}
        <Box flex="1.2" maxW={{ lg: '600px' }}>
          <MotionBox variants={fadeUp}>
            <HStack
              bg="var(--bg-hover)"
              border="1px solid"
              borderColor="var(--border-light)"
              rounded="full"
              px={4}
              py={1.5}
              w="fit-content"
              mb={6}
            >
              <Sparkles size={14} color="var(--accent)" />
              <Text fontSize="xs" color="var(--text-secondary)" fontWeight="medium">
                AI-powered learning platform
              </Text>
            </HStack>
          </MotionBox>

          <MotionBox variants={fadeUp}>
            <Text
              fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
              fontWeight="800"
              lineHeight="1.1"
              letterSpacing="-0.02em"
              mb={2}
            >
              Master Any Topic
            </Text>
            <Text
              fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
              fontWeight="800"
              lineHeight="1.1"
              letterSpacing="-0.02em"
            >
              <TypewriterText text="In One Hour." delay={800} />
            </Text>
          </MotionBox>

          <MotionBox variants={fadeUp} mt={6}>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="var(--text-secondary)"
              lineHeight="1.7"
              maxW="480px"
            >
              Generate AI-powered courses, take smart notes, and query your
              knowledge base with RAG — all in one place.
            </Text>
          </MotionBox>

          <MotionBox variants={fadeUp} mt={10}>
            <HStack gap={4} flexWrap="wrap">
              <Button
                size="lg"
                px={8}
                h={14}
                fontWeight="bold"
                color="black"
                bg="linear-gradient(135deg, var(--accent) 0%, #92FE9D 100%)"
                rounded="xl"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(0, 201, 167, 0.3)',
                }}
                transition="all 0.2s ease"
                onClick={() => navigate('/signin')}
              >
                Get Started Free
                <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Button>

              <Button
                size="lg"
                px={8}
                h={14}
                variant="ghost"
                color="var(--text-body)"
                border="1px solid"
                borderColor="var(--border-hover)"
                rounded="xl"
                _hover={{
                  bg: 'var(--bg-hover)',
                  borderColor: 'var(--border-hover)',
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.2s ease"
                onClick={() => navigate('/signin')}
              >
                Log In
              </Button>
            </HStack>
          </MotionBox>

          {/* Social proof */}
          <MotionBox variants={fadeUp} mt={10}>
            <HStack gap={6}>
              <HStack gap={-2}>
                {['var(--blue)', 'var(--accent)', 'var(--purple)', 'var(--warning)'].map((c, i) => (
                  <Box
                    key={i}
                    w={8}
                    h={8}
                    rounded="full"
                    bg={c}
                    border="2px solid"
                    borderColor="#06080F"
                    ml={i > 0 ? -2 : 0}
                  />
                ))}
              </HStack>
              <Text fontSize="sm" color="var(--text-muted)">
                Join learners mastering topics every day
              </Text>
            </HStack>
          </MotionBox>
        </Box>

        {/* Right — Hero Image */}
        <MotionBox
          variants={scaleIn}
          flex="1"
          display={{ base: 'none', lg: 'block' }}
          position="relative"
        >
          <Box
            position="absolute"
            inset={-4}
            bg="linear-gradient(135deg, rgba(var(--accent-rgb),0.15), rgba(var(--blue-rgb),0.15))"
            rounded="3xl"
            filter="blur(40px)"
          />
          <Box
            position="relative"
            rounded="2xl"
            overflow="hidden"
            border="1px solid"
            borderColor="var(--border-light)"
            boxShadow="0 25px 50px rgba(0,0,0,0.5)"
          >
            <img
              src={landingImg}
              alt="Learning Illustration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Gradient overlay */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              h="40%"
              bg="linear-gradient(transparent, rgba(6,8,15,0.8))"
            />
          </Box>
        </MotionBox>
      </MotionFlex>

      {/* Features Section */}
      <Box px={{ base: 6, md: 12, lg: 20 }} pb={24} maxW="8xl" mx="auto" position="relative" zIndex={5}>
        <MotionBox
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          mb={12}
        >
          <Text
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            textAlign="center"
          >
            Everything you need to{' '}
            <Box as="span" color="var(--accent)">learn faster</Box>
          </Text>
        </MotionBox>

        <MotionFlex
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          direction={{ base: 'column', md: 'row' }}
          gap={6}
        >
          {features.map((f, i) => (
            <FeatureCard key={i} index={i} {...f} />
          ))}
        </MotionFlex>
      </Box>

      {/* Bottom CTA */}
      <MotionBox
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        textAlign="center"
        pb={20}
        px={6}
        position="relative"
        zIndex={5}
      >
        <Text fontSize="lg" color="var(--text-muted)" mb={6}>
          Ready to learn smarter?
        </Text>
        <Button
          size="lg"
          px={10}
          h={14}
          fontWeight="bold"
          color="black"
          bg="linear-gradient(135deg, var(--accent) 0%, #92FE9D 100%)"
          rounded="xl"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0, 201, 167, 0.3)',
          }}
          transition="all 0.2s ease"
          onClick={() => navigate('/signin')}
        >
          Start Learning Now
          <ArrowRight size={18} style={{ marginLeft: 8 }} />
        </Button>
      </MotionBox>
    </Box>
  );
}

export default LandingPage;
