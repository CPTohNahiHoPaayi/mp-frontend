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
  IconButton
} from '@chakra-ui/react';
import { CloseButton, Drawer, Portal } from "@chakra-ui/react"
import LessonRenderer from './LessonRenderer';
import LessonSpeaker from './LessonSpeaker';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toaster } from '@/components/ui/toaster';

import { FaWindowClose } from "react-icons/fa";
import LessonPDFExporter from './LessonPDFExporter';
import { useAuth } from '@/context/AuthContext';
function LessonPage() {
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const mIndex = Number(moduleIndex);
  const lIndex = Number(lessonIndex);
  const navigate = useNavigate();
  const { meta, setMeta } = useOutletContext();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false)
  const printRef = useRef();
  const baseURL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${baseURL}/api/courses/${courseId}/module/${moduleIndex}/lesson/${lessonIndex}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLesson(res.data.lesson || null);
        setMeta(res.data.meta || null);

      } catch (err) {
        console.error('❌ Failed to load lesson:', err);
        setLesson(null);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
    // console.log(meta);
    // console.log(lesson);
  }, [courseId, moduleIndex, lessonIndex]);

  const goToNext = () => {
    if (!meta) return;
    const moduleCount = meta.modules.length;
    const lessonCount = meta.modules[mIndex].lessons.length;

    if (lIndex + 1 < lessonCount) {
      navigate(`/courses/${courseId}/module/${mIndex}/lesson/${lIndex + 1}`);
    } else if (mIndex + 1 < moduleCount) {
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

  const isFirstLesson = mIndex === 0 && lIndex === 0;
  const isLastLesson =
    meta &&
    mIndex === meta.modules.length - 1 &&
    lIndex === meta.modules[mIndex].lessons.length - 1;


  return (
    <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>


      <Box h="full" display="flex" flexDir="column">
        {/* {meta && <RightCourseDrawer meta={meta} />} */}
        {loading ? (
          <Box
            height="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
          >
            <Spinner />
            <Text ml={3}>Loading lesson...</Text>
          </Box>
        ) : !lesson ? (
          <Box flex="1" display="flex" alignItems="center" justifyContent="center">
            <Text color="red.400">No lesson found for this course.</Text>
          </Box>
        ) : (
          <>

            <HStack>

              <Box flex="1" overflowY="auto">
                <Box maxW="1000px" w="100%" mx="auto" px={4} py={6} ref={printRef}>
                  <LessonRenderer lesson={lesson} />
                </Box>

              </Box>
              {meta && (
                <Portal>
                  <Drawer.Backdrop bg="blackAlpha.600" />
                  <Drawer.Positioner>
                    <Drawer.Content
                      bg="ghost"
                      color="white"
                      shadow="lg"
                      maxW="50vw"
                      h="100vh"
                      display="flex"
                      flexDirection="column"
                      borderLeft="1px solid"
                      borderColor="whiteAlpha.200"
                    >
                      {/* Minimal Header */}
                      <Drawer.Header
                        borderBottom="1px solid"
                        borderColor="whiteAlpha.200"
                        px={6}
                        py={4}
                      >
                        <Flex justify="space-between" align="center">
                          <VStack align="flex-start" spacing={1}>
                            <Text fontSize="lg" fontWeight="semibold" color="whiteAlpha.900">
                              Course Navigation
                            </Text>
                            <Text fontSize="sm" color="whiteAlpha.600">
                              {meta?.modules?.length || 0} modules • {meta?.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0} lessons
                            </Text>
                          </VStack>
                          <Drawer.CloseTrigger asChild>
                            <IconButton
                              size="lg"
                              variant="ghost"
                              color="whiteAlpha.700"
                              _hover={{
                                color: 'white',
                                bg: 'whiteAlpha.100'
                              }}
                              aria-label="Close navigation"
                            >
                              <FaWindowClose />
                            </IconButton>
                          </Drawer.CloseTrigger>
                        </Flex>
                      </Drawer.Header>

                      {/* Clean Body */}
                      <Drawer.Body px={0} py={4} flex="1" overflowY="auto">
                        <VStack spacing={6} align="stretch">
                          {meta?.modules?.map((module, mIdx) => (
                            <Box key={module.id} px={6}>
                              {/* Minimal Module Header */}
                              <Box
                                mb={3}
                                pb={2}
                                borderBottom="1px solid"
                                borderColor="whiteAlpha.200"
                              >
                                <HStack spacing={3}>
                                  <Box
                                    w={8}
                                    h={8}
                                    borderRadius="md"
                                    bg="whiteAlpha.200"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexShrink={0}
                                  >
                                    <Text fontSize="sm" fontWeight="semibold" color="white">
                                      {mIdx + 1}
                                    </Text>
                                  </Box>
                                  <VStack align="flex-start" spacing={0} flex={1}>
                                    <Text fontSize="md" fontWeight="semibold" color="whiteAlpha.900">
                                      Module {mIdx + 1}
                                    </Text>
                                    <Text
                                      fontSize="sm"
                                      color="whiteAlpha.700"
                                      fontWeight="medium"
                                      whiteSpace="nowrap"
                                      textOverflow="ellipsis"
                                      overflow="hidden"
                                      maxW="100%"
                                    >
                                      {module.title}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </Box>

                              {/* Clean Lessons List */}
                              <VStack spacing={1} align="stretch" pl={4}>
                                {module.lessons.map((lesson, lIdx) => {
                                  const isActive =
                                    mIdx === Number(moduleIndex) &&
                                    lIdx === Number(lessonIndex);

                                  return (
                                    <Button
                                      key={lesson.id}
                                      variant="ghost"
                                      justifyContent="flex-start"
                                      size="md"
                                      fontWeight={isActive ? "semibold" : "medium"}
                                      bg={isActive ? "blue.600" : "transparent"}
                                      color={isActive ? "white" : "whiteAlpha.800"}
                                      w="100%"
                                      h="auto"
                                      py={3}
                                      px={3}
                                      borderRadius="lg"
                                      border="1px solid"
                                      borderColor={isActive ? "blue.500" : "transparent"}
                                      onClick={() =>
                                        navigate(
                                          `/courses/${courseId}/module/${mIdx}/lesson/${lIdx}`
                                        )
                                      }
                                      _hover={{
                                        bg: isActive ? "blue.500" : "purple.400",
                                        // color:isActive?"white":"black",
                                        borderColor: isActive ? "blue.400" : "whiteAlpha.200",
                                        transform: "translateX(4px)",
                                      }}
                                      transition="all 0.2s ease"
                                    >
                                      <HStack spacing={3} w="full">
                                        {/* Simple lesson indicator */}
                                        <Box
                                          w={6}
                                          h={6}
                                          borderRadius="md"
                                          bg={isActive ? "whiteAlpha.300" : "whiteAlpha.200"}
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="center"
                                          flexShrink={0}
                                        >
                                          <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color={isActive ? "white" : "whiteAlpha.800"}
                                          >
                                            {lIdx + 1}
                                          </Text>
                                        </Box>

                                        {/* Lesson title */}
                                        <Text
                                          fontSize="sm"
                                          fontWeight={isActive ? "semibold" : "medium"}
                                          textAlign="left"
                                          flex={1}
                                          whiteSpace="nowrap"
                                          textOverflow="ellipsis"
                                          overflow="hidden"
                                        >
                                          {lesson.title}
                                        </Text>
                                      </HStack>
                                    </Button>
                                  );
                                })}
                              </VStack>
                            </Box>
                          ))}
                        </VStack>
                      </Drawer.Body>

                      {/* Minimal Footer */}
                      <Drawer.Footer
                        borderTop="1px solid"
                        borderColor="whiteAlpha.200"
                        px={6}
                        py={4}
                      >
                        <Button
                          variant="outline"
                          w="full"
                          size="md"
                          borderColor="whiteAlpha.300"
                          color="whiteAlpha.800"
                          fontWeight="medium"
                          onClick={() => setOpen(false)}
                          _hover={{
                            bg: "whiteAlpha.100",
                            borderColor: "whiteAlpha.400",
                            color: "white"
                          }}
                        >
                          Close
                        </Button>
                      </Drawer.Footer>
                    </Drawer.Content>
                  </Drawer.Positioner>
                </Portal>
              )}



            </HStack>


            <Box
              bottom={0}
              borderTop={"2px solid"}
              borderColor="white"
              position="sticky"
              zIndex={10}
              bg="gray.900"
            >
              <HStack spacing={4} align="stretch" p={2}>
                <Box flex={1}   borderRadius="lg">
                  <LessonSpeaker lesson={lesson} />
                </Box>

                <Box flex={1} borderRadius="lg">
                  <HStack justify="center">
                    <Button
                      onClick={goToPrevious}
                      isDisabled={isFirstLesson}
                      variant="outline"
                      size="md"
                      colorScheme="gray"
                      borderRadius="xl"
                      color="white"
                      borderColor="gray.500"
                      _hover={{ bg: "gray.700", color: "white" }}
                      _active={{ bg: "gray.600" }}
                    >
                      ← Previous
                    </Button>

                    <Button
                      onClick={goToNext}
                      isDisabled={isLastLesson}
                      colorScheme="blue"
                      size="md"
                      borderRadius="xl"
                      boxShadow="sm"
                      _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                      _active={{ boxShadow: "sm", transform: "translateY(0)" }}
                    >
                      Next →
                    </Button>
                  </HStack>
                </Box>

                <Box flex={1} borderRadius="lg">
                  <Flex justify="center" align="center">
                    <Drawer.Trigger asChild>
                      <Button size="xl" variant="outline" border={"1px solid white"}>
                        Jump To
                      </Button>
                    </Drawer.Trigger>
                  </Flex>
                </Box>
              </HStack>

              
            </Box>
            <LessonPDFExporter
                contentData={lesson?.content || []}
                fileName={`${lesson?.title || 'lesson'}.pdf`}
              />

          </>
        )}
      </Box>
    </Drawer.Root>
  );
}

export default LessonPage;
