import React from 'react'
import {
    Flex,
    Box,
    Stack,
    IconButton,
    HStack,
    Breadcrumb,
    Button,
    Text,
    useBreakpointValue,
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
const MotionBox = motion(Box);
function LandingPage() {
    const navigate = useNavigate();
    return (
        
        <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)"
        color="white"
        overflow="hidden"
        zIndex={0}
      >
        {/* Subtle background glow */}
        <Flex px={8} py={4} align="center" justify="space-between" position="relative" zIndex={1}>
          <Text fontSize="2xl" fontWeight="bold" letterSpacing="wide">
            Text
            <Box as="span" color="#00C9A7">ToLearn</Box>
          </Text>
        </Flex>
      
        {/* Hero Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="center"
          textAlign="left"
          px={6}
          pt={{ base: 16, md: 24 }}
          pb={28}
          position="relative"
          zIndex={1}
          maxW="7xl"
          mx="auto"
          h="calc(100vh - 80px)" // adjust for navbar height if needed
        >
          {/* Left Side - Text & CTA */}
          <Box flex="1" pr={{ md: 10 }} mb={{ base: 10, md: 0 }}>
            <MotionBox
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Text fontSize={{ base: "3xl", md: "5xl" }} fontWeight="bold" lineHeight="1.2">
                Master Any Topic
                <br />
                In Just One Hour
              </Text>
            </MotionBox>
      
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <Text mt={4} fontSize="lg" color="green.200" fontWeight="medium" letterSpacing="wider">
                Choose to learn smart, not hard.
              </Text>
              <Text mt={4} fontSize={{ base: "md", md: "lg" }} color="gray.300" maxW="500px">
                Unlock AI-powered learning. Choose a topic and get custom lessons,
                code examples, quizzes, and revision — instantly.
              </Text>
            </MotionBox>
      
            <MotionBox
              mt={10}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <HStack spacing={5} flexWrap="wrap">
                <Button
                  size="lg"
                  px={8}
                  py={6}
                  fontWeight="bold"
                  color="black"
                  bg="linear-gradient(135deg, #00C9A7 0%, #92FE9D 100%)"
                  _hover={{
                    bg: "linear-gradient(135deg, #89F7FE 0%, #66A6FF 100%)",
                    boxShadow: "0 0 20px rgba(0, 201, 167, 0.4)",
                  }}
                  onClick={() => navigate('/signin')}
                >
                  Get Started Free
                </Button>
      
                <Button
                  size="lg"
                  px={8}
                  py={6}
                  variant="ghost"
                  color="gray.100"
                  _hover={{
                    bg: "whiteAlpha.200",
                    borderColor: "whiteAlpha.300",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.15)",
                  }}
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  onClick={() => navigate('/signin')}
                >
                  Log In
                </Button>
              </HStack>
            </MotionBox>
          </Box>
      
          {/* Right Side - Image */}
          <Box flex="1" display={{ base: "none", md: "block" }}>
                
            <img
              src="/src/assets/landinPagePng.png"
              alt="Learning Illustration"
              style={{
                
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "1rem",
              }}
            />
          </Box>
        </Flex>
      </Box>
      
        
    )
}

export default LandingPage