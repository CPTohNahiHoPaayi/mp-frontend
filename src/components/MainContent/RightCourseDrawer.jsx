import {
    Drawer,
    Button,
    Box,
    Text,
    VStack,
    Accordion,
    Span,
  } from "@chakra-ui/react";
  import { useDisclosure } from "@chakra-ui/react";
  import { useParams, useNavigate } from "react-router-dom";
  
  export default function RightCourseDrawer({ meta }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { courseId } = useParams();
    const navigate = useNavigate();
  
    return (
      <>
        {/* Trigger Button */}
        <Button onClick={onOpen} position="fixed" top="4" right="4" zIndex="20">
          Course Navigation
        </Button>
  
        {/* Drawer */}
        <Drawer.Root open={isOpen} onClose={onClose}>
          <Drawer.Backdrop />
          <Drawer.Trigger />
          <Drawer.Positioner>
            <Drawer.Content maxW="sm">
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Title>{meta?.title || "Untitled Course"}</Drawer.Title>
              </Drawer.Header>
  
              <Drawer.Body>
                {/* Accordion for modules and lessons */}
                <Accordion.Root multiple defaultValue={["0"]}>
                  {meta?.modules?.map((module, mIndex) => (
                    <Accordion.Item key={mIndex} value={String(mIndex)}>
                      <Accordion.ItemTrigger py={2}>
                        <Span flex="1">{module.title}</Span>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <Accordion.ItemBody>
                          <VStack align="start" spacing={1} px={2} py={1}>
                            {module.lessons.map((lesson, lIndex) => (
                              <Button
                                key={lIndex}
                                variant="ghost"
                                size="sm"
                                w="full"
                                justifyContent="start"
                                onClick={() => {
                                  navigate(`/courses/${courseId}/module/${mIndex}/lesson/${lIndex}`);
                                  onClose();
                                }}
                              >
                                {lesson.title}
                              </Button>
                            ))}
                          </VStack>
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </Drawer.Body>
  
              {/* Optional Footer */}
              <Drawer.Footer>
                <Text fontSize="sm" color="gray.500">
                  Navigate to any lesson
                </Text>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
      </>
    );
  }
  