import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Flex, Text, Button, HStack, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Brain,
  Zap,
  BookOpen,
  StickyNote,
  Search,
  ArrowRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

/* ═══════════════════════════════════════════════════════════
   PRETEXT HERO — Neural text ocean with fluid dynamics
   ═══════════════════════════════════════════════════════════ */

const WORDS = [
  'MIND', 'PALACE', 'LEARN', 'THINK', 'RECALL', 'NOTES', 'COURSES',
  'QUIZ', 'AI', 'RAG', 'IDEAS', 'MEMORY', 'FOCUS', 'STUDY', 'BUILD',
  'BRAIN', 'KNOWLEDGE', 'EXPLORE', 'CREATE', 'GROW', 'WONDER',
  'INSIGHT', 'WISDOM', 'NEURON', 'SYNAPSE', 'CORTEX', 'LOCI',
  'IMAGINE', 'DISCOVER', 'REASON', 'LOGIC', 'DREAM', 'EVOLVE',
];

const PALETTES = [
  { h: 187, s: 96, l: 43 },  // cyan (accent)
  { h: 263, s: 70, l: 58 },  // purple
  { h: 217, s: 91, l: 60 },  // blue
  { h: 36, s: 91, l: 50 },   // amber
  { h: 160, s: 84, l: 39 },  // green
  { h: 330, s: 81, l: 60 },  // pink
];

function PretextHero() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    nodes: [],
    particles: [],
    mouse: { x: -9999, y: -9999, px: -9999, py: -9999 },
    time: 0,
    initialized: false,
  });

  const initNodes = useCallback((w, h) => {
    const st = stateRef.current;
    const nodes = [];
    const count = Math.min(Math.floor((w * h) / 2800), 350);

    for (let i = 0; i < count; i++) {
      const word = WORDS[i % WORDS.length];
      const charIdx = Math.floor(Math.random() * word.length);
      const palette = PALETTES[i % PALETTES.length];
      const size = 10 + Math.random() * 8;

      // Spawn outside the center exclusion zone
      let nx, ny;
      do {
        nx = Math.random() * w;
        ny = Math.random() * h;
      } while (
        nx > w * 0.15 && nx < w * 0.85 &&
        ny > h * 0.15 && ny < h * 0.65
      );

      nodes.push({
        x: nx,
        y: ny,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        char: word[charIdx],
        size,
        palette,
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: 0.15 + Math.random() * 0.25,
        pulsePhase: Math.random() * Math.PI * 2,
        brightness: 0,
      });
    }

    st.nodes = nodes;
    st.initialized = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let raf;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!stateRef.current.initialized) {
        initNodes(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Physics constants
    const REPEL_R = 160;
    const REPEL_FORCE = 22;
    const CONNECTION_R = 100;
    const DAMPING = 0.94;
    const MARGIN = 20;

    const animate = (timestamp) => {
      const st = stateRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const mx = st.mouse.x;
      const my = st.mouse.y;
      const dt = 1 / 60;
      st.time += dt;

      ctx.clearRect(0, 0, w, h);

      // ─── Draw connections ───
      ctx.lineWidth = 0.5;
      for (let i = 0; i < st.nodes.length; i++) {
        const a = st.nodes[i];
        for (let j = i + 1; j < st.nodes.length; j++) {
          const b = st.nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_R) {
            const alpha = (1 - dist / CONNECTION_R) * 0.12;
            // Color connections based on shared palette
            const hue = (a.palette.h + b.palette.h) / 2;
            ctx.strokeStyle = `hsla(${hue}, 60%, 50%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // ─── Text exclusion zone (center of viewport where HTML text sits) ───
      const exclLeft = w * 0.2;
      const exclRight = w * 0.8;
      const exclTop = h * 0.18;
      const exclBottom = h * 0.62;
      const exclPad = 40; // extra push padding

      // ─── Update + draw nodes ───
      for (const node of st.nodes) {
        // Mouse repulsion
        const dx = node.x - mx;
        const dy = node.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_R && dist > 1) {
          const force = ((REPEL_R - dist) / REPEL_R) ** 2 * REPEL_FORCE;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
          node.brightness = Math.min(1, node.brightness + 0.15);
        } else {
          node.brightness *= 0.96;
        }

        // Organic drift
        node.driftAngle += (Math.random() - 0.5) * 0.06;
        node.vx += Math.cos(node.driftAngle) * node.driftSpeed * dt;
        node.vy += Math.sin(node.driftAngle) * node.driftSpeed * dt;

        // Gravity toward upper-center (not dead center)
        node.vx += (w / 2 - node.x) * 0.00003;
        node.vy += (h * 0.25 - node.y) * 0.00003;

        // ── Exclusion zone repulsion ──
        // Push nodes OUT of the text rectangle
        const inX = node.x > exclLeft - exclPad && node.x < exclRight + exclPad;
        const inY = node.y > exclTop - exclPad && node.y < exclBottom + exclPad;
        if (inX && inY) {
          // Find nearest edge and push toward it
          const dLeft = node.x - (exclLeft - exclPad);
          const dRight = (exclRight + exclPad) - node.x;
          const dTop = node.y - (exclTop - exclPad);
          const dBot = (exclBottom + exclPad) - node.y;
          const minD = Math.min(dLeft, dRight, dTop, dBot);

          if (minD === dLeft) node.vx -= 1.5;
          else if (minD === dRight) node.vx += 1.5;
          else if (minD === dTop) node.vy -= 1.5;
          else node.vy += 1.5;
        }

        // Damping + integrate
        node.vx *= DAMPING;
        node.vy *= DAMPING;
        node.x += node.vx;
        node.y += node.vy;

        // Soft edges
        if (node.x < MARGIN) node.vx += (MARGIN - node.x) * 0.15;
        if (node.x > w - MARGIN) node.vx += (w - MARGIN - node.x) * 0.15;
        if (node.y < MARGIN) node.vy += (MARGIN - node.y) * 0.15;
        if (node.y > h - MARGIN) node.vy += (h - MARGIN - node.y) * 0.15;

        // Pulse
        const pulse = Math.sin(st.time * 1.5 + node.pulsePhase) * 0.15 + 0.85;
        const { h: hue, s, l } = node.palette;

        // Glow behind bright nodes
        if (node.brightness > 0.3) {
          const glowR = node.size * 2.5 * node.brightness;
          const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
          grad.addColorStop(0, `hsla(${hue}, ${s}%, ${l}%, ${node.brightness * 0.2})`);
          grad.addColorStop(1, `hsla(${hue}, ${s}%, ${l}%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw node circle
        const baseAlpha = 0.04 + node.brightness * 0.3;
        const borderAlpha = 0.08 + node.brightness * 0.5;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${s}%, ${l}%, ${baseAlpha})`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${hue}, ${s}%, ${l}%, ${borderAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Draw character
        const textAlpha = 0.1 + node.brightness * 0.7;
        const fontSize = node.size * 0.75;

        ctx.font = `${fontSize}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `hsla(${hue}, ${s + 10}%, ${l + 15}%, ${textAlpha})`;
        ctx.fillText(node.char, node.x, node.y + 1);
      }

      // ─── Cursor trail particles ───
      if (mx > 0 && my > 0) {
        // Spawn particles on movement
        const mdx = mx - st.mouse.px;
        const mdy = my - st.mouse.py;
        const mSpeed = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mSpeed > 2) {
          const count = Math.min(Math.floor(mSpeed / 4), 5);
          for (let i = 0; i < count; i++) {
            const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
            st.particles.push({
              x: mx + (Math.random() - 0.5) * 10,
              y: my + (Math.random() - 0.5) * 10,
              vx: (Math.random() - 0.5) * 3 - mdx * 0.1,
              vy: (Math.random() - 0.5) * 3 - mdy * 0.1,
              life: 1,
              size: 1.5 + Math.random() * 2.5,
              hue: palette.h,
              sat: palette.s,
              lit: palette.l,
            });
          }
        }
      }

      // Update + draw particles
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= 0.02;

        if (p.life <= 0) {
          st.particles.splice(i, 1);
          continue;
        }

        const alpha = p.life * 0.6;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.lit}%, ${alpha})`);
        grad.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.lit}%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── Mouse glow ───
      if (mx > 0 && my > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, REPEL_R);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
        grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.01)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mx, my, REPEL_R, 0, Math.PI * 2);
        ctx.fill();
      }

      st.mouse.px = mx;
      st.mouse.py = my;

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    // Event handlers
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouse.x = e.clientX - rect.left;
      stateRef.current.mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      stateRef.current.mouse.x = -9999;
      stateRef.current.mouse.y = -9999;
    };
    const onTouch = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      if (t) {
        stateRef.current.mouse.x = t.clientX - rect.left;
        stateRef.current.mouse.y = t.clientY - rect.top;
      }
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('touchend', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchend', onLeave);
    };
  }, [initNodes]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        cursor: 'none',
      }}
    />
  );
}

/* ─── Custom cursor overlay ─── */
function CustomCursor() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let mx = -100, my = -100;
    let cx = -100, cy = -100;

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const onLeave = () => { mx = -100; my = -100; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    const tick = () => {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${cx - 20}px, ${cy - 20}px)`;
      }
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <>
      <Box
        ref={cursorRef}
        position="fixed"
        top={0}
        left={0}
        w="8px"
        h="8px"
        borderRadius="full"
        bg="var(--accent)"
        pointerEvents="none"
        zIndex={9999}
        mixBlendMode="screen"
        display={{ base: 'none', md: 'block' }}
      />
      <Box
        ref={ringRef}
        position="fixed"
        top={0}
        left={0}
        w="40px"
        h="40px"
        borderRadius="full"
        border="1px solid"
        borderColor="rgba(6,182,212,0.3)"
        pointerEvents="none"
        zIndex={9999}
        display={{ base: 'none', md: 'block' }}
      />
    </>
  );
}

/* ─── Rooms of the Palace ─── */
const rooms = [
  {
    icon: BookOpen,
    title: 'The Study',
    subtitle: 'AI-Generated Courses',
    desc: 'Type a topic. Get a full course with modules, lessons, quizzes, and code blocks — generated in seconds.',
    accent: 'var(--accent)',
    accentRgb: 'var(--accent-rgb)',
    num: '01',
  },
  {
    icon: StickyNote,
    title: 'The Library',
    subtitle: 'Smart Notes',
    desc: 'A rich editor for capturing ideas, with slash commands, tables, code blocks, and AI-powered enhancement.',
    accent: 'var(--purple)',
    accentRgb: 'var(--purple-rgb)',
    num: '02',
  },
  {
    icon: Search,
    title: 'The Oracle',
    subtitle: 'Ask Your Notes (RAG)',
    desc: 'Ingest your notes, then ask anything. The AI retrieves relevant chunks and synthesizes an answer with sources.',
    accent: 'var(--blue)',
    accentRgb: 'var(--blue-rgb)',
    num: '03',
  },
  {
    icon: Zap,
    title: 'The Arena',
    subtitle: 'Instant Quizzes',
    desc: 'MCQs, flashcards, and true/false scattered through every lesson. Test yourself as you learn.',
    accent: 'var(--warning)',
    accentRgb: 'var(--warning-rgb)',
    num: '04',
  },
];

/* ─── Scroll-reveal ─── */
function RevealBlock({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionBox>
  );
}

/* ─── Room card ─── */
function RoomCard({ room, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const isWide = index === 0 || index === 3;

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      gridColumn={{ base: 'span 1', md: isWide ? 'span 2' : 'span 1' }}
      position="relative"
      overflow="hidden"
      rounded="2xl"
      border="1px solid"
      borderColor="var(--border-light)"
      bg="var(--bg-surface)"
      p={{ base: 6, md: 8 }}
      minH="220px"
      cursor="default"
      role="group"
      _hover={{
        borderColor: room.accent,
        boxShadow: `0 0 60px rgba(${room.accentRgb}, 0.1)`,
      }}
      transition="all 0.4s ease"
    >
      {/* Corner glow */}
      <Box
        position="absolute"
        top={-30}
        right={-30}
        w="180px"
        h="180px"
        borderRadius="50%"
        bg={`rgba(${room.accentRgb}, 0.05)`}
        filter="blur(60px)"
        transition="all 0.5s ease"
        _groupHover={{ opacity: 1, transform: 'scale(1.8)' }}
      />

      {/* Number watermark */}
      <Text
        position="absolute"
        top={4}
        right={6}
        fontSize="6xl"
        fontWeight="900"
        color={`rgba(${room.accentRgb}, 0.04)`}
        lineHeight="1"
        userSelect="none"
        _groupHover={{ color: `rgba(${room.accentRgb}, 0.08)` }}
        transition="all 0.4s ease"
      >
        {room.num}
      </Text>

      <Flex direction="column" gap={4} position="relative" zIndex={1}>
        <Flex align="center" gap={3}>
          <Box
            w={10}
            h={10}
            rounded="lg"
            bg={`rgba(${room.accentRgb}, 0.1)`}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            border="1px solid"
            borderColor={`rgba(${room.accentRgb}, 0.15)`}
          >
            <room.icon size={20} color={room.accent} />
          </Box>
          <Box>
            <Text fontSize="xs" color="var(--text-muted)" fontWeight="medium" textTransform="uppercase" letterSpacing="0.1em">
              {room.title}
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="var(--text-primary)">
              {room.subtitle}
            </Text>
          </Box>
        </Flex>
        <Text fontSize="sm" color="var(--text-secondary)" lineHeight="1.7" maxW="500px">
          {room.desc}
        </Text>
      </Flex>
    </MotionBox>
  );
}

/* ═══════════════════════════════════════════ */
/*                LANDING PAGE                 */
/* ═══════════════════════════════════════════ */

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
      <CustomCursor />

      {/* ─── Navbar ─── */}
      <MotionFlex
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        px={{ base: 5, md: 10 }}
        py={4}
        align="center"
        justify="space-between"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={50}
        bg="var(--bg-nav)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="var(--border-subtle)"
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
            <Brain size={16} color="white" />
          </Box>
          <Text fontSize="lg" fontWeight="bold" letterSpacing="-0.01em">
            Mind<Box as="span" color="var(--accent)">Palace</Box>
          </Text>
        </HStack>
        <HStack gap={3}>
          <Button
            size="sm"
            variant="ghost"
            color="var(--text-muted)"
            _hover={{ color: 'var(--text-primary)' }}
            onClick={() => navigate('/signin')}
            fontWeight="medium"
          >
            Sign In
          </Button>
          <Button
            size="sm"
            bg="var(--accent)"
            color="black"
            fontWeight="semibold"
            rounded="lg"
            px={5}
            _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
            transition="all 0.2s ease"
            onClick={() => navigate('/signin')}
          >
            Get Started
          </Button>
        </HStack>
      </MotionFlex>

      {/* ─── HERO with Pretext Canvas (viewport-locked) ─── */}
      <Box
        position="sticky"
        top={0}
        h="100vh"
        overflow="hidden"
        zIndex={1}
      >
        <PretextHero />

        {/* Overlay content — lower half to avoid formation overlap */}
        <Flex
          direction="column"
          align="center"
          justify="flex-end"
          textAlign="center"
          h="100vh"
          px={6}
          pb={{ base: 16, md: 20 }}
          position="relative"
          zIndex={10}
          pointerEvents="none"
        >
          {/* Badge */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            pointerEvents="auto"
          >
            <HStack
              bg="rgba(var(--accent-rgb), 0.08)"
              border="1px solid rgba(var(--accent-rgb), 0.15)"
              rounded="full"
              px={4}
              py={1.5}
              mb={8}
              backdropFilter="blur(16px)"
            >
              <Sparkles size={13} color="var(--accent)" />
              <Text fontSize="xs" color="var(--accent)" fontWeight="medium">
                Your personal palace of knowledge
              </Text>
            </HStack>
          </MotionBox>

          {/* Headline */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Text
              fontSize={{ base: '5xl', md: '7xl', lg: '9xl' }}
              fontWeight="900"
              lineHeight="0.9"
              letterSpacing="-0.05em"
              maxW="1000px"
              textShadow="0 0 80px rgba(var(--accent-rgb), 0.2), 0 4px 40px rgba(0,0,0,0.5)"
            >
              Build Your
            </Text>
            <Text
              fontSize={{ base: '5xl', md: '7xl', lg: '9xl' }}
              fontWeight="900"
              lineHeight="0.9"
              letterSpacing="-0.05em"
              bg="linear-gradient(135deg, var(--accent) 0%, var(--blue) 40%, var(--purple) 100%)"
              bgClip="text"
              mt={2}
              style={{ WebkitTextStroke: '0.5px rgba(var(--accent-rgb), 0.1)' }}
            >
              Mind Palace
            </Text>
          </MotionBox>

          {/* Subtext */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            mt={10}
            maxW="500px"
          >
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="var(--text-secondary)"
              lineHeight="1.8"
              textShadow="0 2px 20px rgba(0,0,0,0.6)"
            >
              Generate AI courses, capture smart notes, and recall anything instantly.
              Your knowledge, always at your fingertips.
            </Text>
          </MotionBox>

          {/* CTA */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            mt={10}
            pointerEvents="auto"
          >
            <HStack gap={4}>
              <Button
                size="lg"
                px={10}
                h={14}
                fontWeight="bold"
                color="black"
                bg="var(--accent)"
                rounded="full"
                _hover={{
                  transform: 'translateY(-3px)',
                  boxShadow: '0 16px 50px rgba(var(--accent-rgb), 0.35)',
                }}
                transition="all 0.3s ease"
                onClick={() => navigate('/signin')}
              >
                Enter Your Palace
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
                rounded="full"
                backdropFilter="blur(10px)"
                _hover={{
                  bg: 'rgba(255,255,255,0.04)',
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.25s ease"
                onClick={() => navigate('/signin')}
              >
                Log In
              </Button>
            </HStack>
          </MotionBox>

          {/* Interaction hint */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            mt={10}
          >
            <Text fontSize="xs" color="var(--text-dim)" letterSpacing="0.05em">
              ↑ move your cursor through the neural field ↑
            </Text>
          </MotionBox>

          {/* Scroll hint */}
          <MotionBox
            mt={6}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} color="var(--text-dim)" />
          </MotionBox>
        </Flex>
      </Box>

      {/* ─── Content that scrolls over the sticky hero ─── */}
      <Box position="relative" zIndex={2} bg="var(--bg-base)">

      {/* ─── DIVIDER LINE ─── */}
      <Flex justify="center" py={2}>
        <MotionBox
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          w="120px"
          h="1px"
          bg="linear-gradient(90deg, transparent, var(--accent), transparent)"
        />
      </Flex>

      {/* ─── HOW IT WORKS ─── */}
      <Box
        px={{ base: 6, md: 12, lg: 20 }}
        py={{ base: 20, md: 32 }}
        maxW="1100px"
        mx="auto"
        position="relative"
        zIndex={5}
      >
        <RevealBlock>
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color="var(--accent)"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="0.15em"
            mb={4}
          >
            How it works
          </Text>
          <Text
            fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
            fontWeight="800"
            lineHeight="1.05"
            letterSpacing="-0.03em"
            maxW="700px"
          >
            Four rooms.{' '}
            <Box as="span" color="var(--text-muted)">
              One palace.
            </Box>
          </Text>
          <Text fontSize="md" color="var(--text-secondary)" mt={5} maxW="550px" lineHeight="1.7">
            Each room serves a purpose. Together, they turn scattered information
            into deep, lasting understanding.
          </Text>
        </RevealBlock>
      </Box>

      {/* ─── BENTO GRID ─── */}
      <Box
        px={{ base: 4, md: 10, lg: 16 }}
        pb={{ base: 20, md: 32 }}
        maxW="1100px"
        mx="auto"
        position="relative"
        zIndex={5}
      >
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
          gap={5}
        >
          {rooms.map((room, i) => (
            <RoomCard key={room.title} room={room} index={i} />
          ))}
        </Box>
      </Box>

      {/* ─── EDITORIAL QUOTE ─── */}
      <Box position="relative" zIndex={5}>
        <RevealBlock>
          <Flex
            direction="column"
            align="center"
            textAlign="center"
            py={{ base: 16, md: 28 }}
            px={6}
          >
            <Box w="60px" h="1px" bg="var(--border-hover)" mb={10} />
            <Text
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="700"
              lineHeight="1.3"
              letterSpacing="-0.02em"
              maxW="650px"
              color="var(--text-primary)"
            >
              "The <Box as="span" color="var(--accent)">method of loci</Box> has been
              used for millennia to organize knowledge. We just made it digital."
            </Text>
            <Text fontSize="sm" color="var(--text-muted)" mt={6}>
              — The Mind Palace philosophy
            </Text>
          </Flex>
        </RevealBlock>
      </Box>

      {/* ─── STATS ─── */}
      <Box
        px={{ base: 6, md: 12, lg: 20 }}
        pb={{ base: 16, md: 24 }}
        maxW="1100px"
        mx="auto"
        position="relative"
        zIndex={5}
      >
        <RevealBlock>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-around"
            align="center"
            gap={{ base: 10, md: 4 }}
            py={12}
            px={{ base: 6, md: 12 }}
            rounded="2xl"
            border="1px solid"
            borderColor="var(--border-light)"
            bg="var(--bg-surface)"
            position="relative"
            overflow="hidden"
          >
            {/* Background accent line */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="1px"
              bg="linear-gradient(90deg, transparent, var(--accent), transparent)"
            />
            {[
              { num: '30s', label: 'to generate a full course' },
              { num: '∞', label: 'topics you can explore' },
              { num: 'RAG', label: 'powered note retrieval' },
            ].map((s) => (
              <VStack key={s.label} gap={2} textAlign="center">
                <Text
                  fontSize={{ base: '4xl', md: '5xl' }}
                  fontWeight="900"
                  letterSpacing="-0.04em"
                  bg="linear-gradient(135deg, var(--accent), var(--blue))"
                  bgClip="text"
                >
                  {s.num}
                </Text>
                <Text fontSize="sm" color="var(--text-muted)">
                  {s.label}
                </Text>
              </VStack>
            ))}
          </Flex>
        </RevealBlock>
      </Box>

      {/* ─── FINAL CTA ─── */}
      <Box position="relative" zIndex={5}>
        <RevealBlock>
          <Flex
            direction="column"
            align="center"
            textAlign="center"
            pt={{ base: 8, md: 16 }}
            pb={{ base: 24, md: 32 }}
            px={6}
          >
            <Text
              fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
              fontWeight="900"
              lineHeight="1.05"
              letterSpacing="-0.04em"
              mb={5}
            >
              Ready to enter?
            </Text>
            <Text fontSize="md" color="var(--text-secondary)" maxW="400px" mb={10} lineHeight="1.7">
              Start building your palace today. It only takes a topic and 30 seconds.
            </Text>
            <Button
              size="lg"
              px={12}
              h={16}
              fontWeight="bold"
              color="black"
              bg="var(--accent)"
              rounded="full"
              fontSize="lg"
              _hover={{
                transform: 'translateY(-3px)',
                boxShadow: '0 20px 60px rgba(var(--accent-rgb), 0.35)',
              }}
              transition="all 0.3s ease"
              onClick={() => navigate('/signin')}
            >
              Enter Your Palace
              <ArrowRight size={20} style={{ marginLeft: 10 }} />
            </Button>
          </Flex>
        </RevealBlock>
      </Box>

      {/* ─── FOOTER ─── */}
      <Flex
        justify="center"
        align="center"
        py={8}
        borderTop="1px solid"
        borderColor="var(--border-subtle)"
        position="relative"
        zIndex={5}
      >
        <HStack gap={2}>
          <Brain size={14} color="var(--text-dim)" />
          <Text fontSize="xs" color="var(--text-dim)">
            Mind Palace
          </Text>
        </HStack>
      </Flex>

      </Box>{/* end scrollable content wrapper */}
    </Box>
  );
}

export default LandingPage;
