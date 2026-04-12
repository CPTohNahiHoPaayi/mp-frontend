import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Spinner,
  Text,
  Button,
  HStack,
  Flex,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import { Drawer, Portal } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, List, X, Play, Volume2 } from 'lucide-react';
import LessonRenderer from './LessonRenderer';
import LessonSpeaker from './LessonSpeaker';
import LessonPDFExporter from './LessonPDFExporter';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

function LessonPage() {
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const mIndex = Number(moduleIndex);
  const lIndex = Number(lessonIndex);
  const navigate = useNavigate();
  const { meta, setMeta } = useOutletContext();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const printRef = useRef();
  const baseURL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${baseURL}/api/courses/${courseId}/module/${moduleIndex}/lesson/${lessonIndex}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLesson(res.data.lesson || null);
        setMeta(res.data.meta || null);
      } catch (err) {
        console.error('Failed to load lesson:', err);
        setLesson(null);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [courseId, moduleIndex, lessonIndex]);

  const goToNext = () => {
    if (!meta) return;
    const lessonCount = meta.modules[mIndex].lessons.length;
    if (lIndex + 1 < lessonCount) {
      navigate(`/courses/${courseId}/module/${mIndex}/lesson/${lIndex + 1}`);
    } else if (mIndex + 1 < meta.modules.length) {
      navigate(`/courses/${courseId}/module/${mIndex + 1}/lesson/0`);
    }
  };

  const goToPrevious = () => {
    if (!meta) return;
    if (lIndex > 0) {
      navigate(`/courses/${courseId}/module/${mIndex}/lesson/${lIndex - 1}`);
    } else if (mIndex > 0) {
      const prevLessonCount = meta.modules[mIndex - 1].lessons.length;
      navigate(`/courses/${courseId}/module/${mIndex - 1}/lesson/${prevLessonCount - 1}`);
    }
  };

  const navigateToLesson = (mIdx, lIdx) => {
    setDrawerOpen(false);
    navigate(`/courses/${courseId}/module/${mIdx}/lesson/${lIdx}`);
  };

  const isFirstLesson = mIndex === 0 && lIndex === 0;
  const isLastLesson =
    meta &&
    mIndex === meta.modules.length - 1 &&
    lIndex === meta.modules[mIndex].lessons.length - 1;

  const currentLessonTitle = lesson?.title || `Lesson ${lIndex + 1}`;
  const currentModuleTitle = meta?.modules?.[mIndex]?.title || `Module ${mIndex + 1}`;

  return (
    <Drawer.Root open={drawerOpen} onOpenChange={(e) => setDrawerOpen(e.open)}>
      <Box h="full" display="flex" flexDir="column">
        {loading ? (
          <Flex h="100%" align="center" justify="center" gap={3}>
            <Spinner color="#00C9A7" />
            <Text color="gray.500" fontSize="sm">Loading lesson...</Text>
          </Flex>
        ) : !lesson ? (
          <Flex flex="1" align="center" justify="center">
            <Text color="red.400">No lesson found for this course.</Text>
          </Flex>
        ) : (
          <>
            {/* Lesson content */}
            <Box flex="1" overflowY="auto">
              <Box maxW="900px" w="100%" mx="auto" px={{ base: 4, md: 8 }} py={8} ref={printRef}>
                <LessonRenderer lesson={lesson} />
              </Box>
            </Box>

            {/* Bottom navigation bar */}
            <Box
              borderTop="1px solid"
              borderColor="whiteAlpha.100"
              bg="rgba(6,8,15,0.95)"
              backdropFilter="blur(12px)"
              px={{ base: 3, md: 6 }}
              py={3}
              flexShrink={0}
            >
              <Flex align="center" justify="space-between" maxW="900px" mx="auto" gap={3}>
                {/* Left: Previous */}
                <Button
                  onClick={goToPrevious}
                  disabled={isFirstLesson}
                  variant="ghost"
                  size="sm"
                  color="#A0AEC0"
                  border="1px solid"
                  borderColor="#1C2030"
                  _hover={{ color: '#E2E8F0', borderColor: '#2A3A50', bg: 'rgba(255,255,255,0.02)' }}
                  _disabled={{ opacity: 0.2, cursor: 'not-allowed' }}
                  rounded="lg"
                  h={9}
                  px={4}
                >
                  <ChevronLeft size={15} />
                  <Text ml={1} display={{ base: 'none', sm: 'block' }}>Previous</Text>
                </Button>

                {/* Center: Info + Actions */}
                <HStack gap={2} flex={1} justify="center" minW={0}>
                  {/* Lesson info */}
                  <Text
                    fontSize="xs"
                    color="gray.600"
                    display={{ base: 'none', md: 'block' }}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    M{mIndex + 1} · L{lIndex + 1}
                  </Text>

                  {/* TTS */}
                  <LessonSpeaker lesson={lesson} />

                  {/* Jump To */}
                  <Drawer.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      color="#718096"
                      _hover={{ color: '#A0AEC0', bg: 'rgba(255,255,255,0.03)' }}
                      rounded="lg"
                      h={9}
                      px={3}
                    >
                      <List size={16} />
                      <Text ml={1.5} display={{ base: 'none', sm: 'block' }}>Contents</Text>
                    </Button>
                  </Drawer.Trigger>

                  {/* PDF */}
                  <LessonPDFExporter
                    contentData={lesson?.content || []}
                    fileName={`${lesson?.title || 'lesson'}.pdf`}
                    lessonTitle={lesson?.title || 'Lesson'}
                  />
                </HStack>

                {/* Right: Next */}
                <Button
                  onClick={goToNext}
                  disabled={isLastLesson}
                  size="sm"
                  color="#E2E8F0"
                  border="1px solid"
                  borderColor="#00C9A7"
                  bg="rgba(0,201,167,0.08)"
                  _hover={{ bg: 'rgba(0,201,167,0.15)', borderColor: '#00C9A7' }}
                  _disabled={{ opacity: 0.2, cursor: 'not-allowed' }}
                  rounded="lg"
                  h={9}
                  px={4}
                  transition="all 0.15s"
                >
                  <Text mr={1} display={{ base: 'none', sm: 'block' }}>Next</Text>
                  <ChevronRight size={15} />
                </Button>
              </Flex>
            </Box>

            {/* Navigation drawer */}
            {meta && (
              <Portal>
                <Drawer.Backdrop bg="blackAlpha.700" />
                <Drawer.Positioner>
                  <Drawer.Content
                    bg="#0A0C14"
                    color="white"
                    maxW="380px"
                    h="100vh"
                    display="flex"
                    flexDirection="column"
                    borderLeft="1px solid"
                    borderColor="whiteAlpha.50"
                  >
                    {/* Header */}
                    <Flex
                      align="center"
                      justify="space-between"
                      px={5}
                      py={4}
                      borderBottom="1px solid"
                      borderColor="whiteAlpha.50"
                    >
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="white">
                          Course Contents
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {meta.modules.length} modules · {meta.modules.reduce((a, m) => a + m.lessons.length, 0)} lessons
                        </Text>
                      </Box>
                      <Drawer.CloseTrigger asChild>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          color="gray.500"
                          _hover={{ color: 'white', bg: 'whiteAlpha.50' }}
                          aria-label="Close"
                        >
                          <X size={18} />
                        </IconButton>
                      </Drawer.CloseTrigger>
                    </Flex>

                    {/* Body */}
                    <Box flex="1" overflowY="auto" py={3}>
                      <VStack gap={4} align="stretch">
                        {meta.modules.map((module, mIdx) => (
                          <Box key={mIdx}>
                            {/* Module header */}
                            <Flex align="center" gap={2} px={5} mb={2}>
                              <Box
                                w={5}
                                h={5}
                                rounded="md"
                                bg={mIdx === mIndex ? 'rgba(0,201,167,0.15)' : 'whiteAlpha.50'}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                              >
                                <Text fontSize="xs" fontWeight="bold" color={mIdx === mIndex ? '#00C9A7' : 'gray.500'}>
                                  {mIdx + 1}
                                </Text>
                              </Box>
                              <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                color={mIdx === mIndex ? 'white' : 'gray.500'}
                                textTransform="uppercase"
                                letterSpacing="wider"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                              >
                                {module.title}
                              </Text>
                            </Flex>

                            {/* Lessons */}
                            <VStack gap={0.5} align="stretch" px={3}>
                              {module.lessons.map((les, lIdx) => {
                                const isActive = mIdx === mIndex && lIdx === lIndex;
                                return (
                                  <Flex
                                    key={lIdx}
                                    as="button"
                                    align="center"
                                    gap={2.5}
                                    px={3}
                                    py={2}
                                    rounded="lg"
                                    bg={isActive ? 'rgba(0,201,167,0.1)' : 'transparent'}
                                    borderLeft="2px solid"
                                    borderColor={isActive ? '#00C9A7' : 'transparent'}
                                    color={isActive ? 'white' : 'gray.400'}
                                    _hover={{
                                      bg: isActive ? 'rgba(0,201,167,0.12)' : 'whiteAlpha.50',
                                      color: 'white',
                                    }}
                                    transition="all 0.15s"
                                    onClick={() => navigateToLesson(mIdx, lIdx)}
                                    w="full"
                                    textAlign="left"
                                  >
                                    <Text
                                      fontSize="xs"
                                      color={isActive ? '#00C9A7' : 'gray.600'}
                                      fontWeight="bold"
                                      flexShrink={0}
                                      w={4}
                                    >
                                      {lIdx + 1}
                                    </Text>
                                    <Text
                                      fontSize="sm"
                                      fontWeight={isActive ? 'semibold' : 'medium'}
                                      overflow="hidden"
                                      textOverflow="ellipsis"
                                      whiteSpace="nowrap"
                                      flex={1}
                                    >
                                      {les.title}
                                    </Text>
                                  </Flex>
                                );
                              })}
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            )}
          </>
        )}
      </Box>
    </Drawer.Root>
  );
}

export default LessonPage;
