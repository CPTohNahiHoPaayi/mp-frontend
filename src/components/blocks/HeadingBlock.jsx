import { Heading, Box, Flex } from "@chakra-ui/react";

const HeadingBlock = ({
  level = 4,
  text,
  align = "left",
  margin = 6,
}) => {
  const config = {
    1: { fontSize: { base: "2xl", md: "3xl" }, color: "#E2E8F0", weight: "800" },
    2: { fontSize: { base: "xl", md: "2xl" }, color: "#E2E8F0", weight: "700" },
    3: { fontSize: { base: "lg", md: "xl" }, color: "#CBD5E0", weight: "600" },
    4: { fontSize: { base: "md", md: "lg" }, color: "#CBD5E0", weight: "600" },
    5: { fontSize: "md", color: "#A0AEC0", weight: "600" },
    6: { fontSize: "sm", color: "#A0AEC0", weight: "600" },
  }[level] || { fontSize: "md", color: "#CBD5E0", weight: "600" };

  return (
    <Box w="full" mb={margin} mt={level <= 2 ? 10 : 6}>
      {level <= 2 && (
        <Box h="1px" bg="#1C2030" mb={6} />
      )}
      <Flex align="center" gap={3}>
        <Box
          w="3px"
          h={level <= 2 ? "28px" : "20px"}
          bg={level <= 2 ? "#00C9A7" : "#2A3A50"}
          rounded="full"
          flexShrink={0}
        />
        <Heading
          as={`h${level}`}
          fontSize={config.fontSize}
          color={config.color}
          fontWeight={config.weight}
          lineHeight="1.35"
          letterSpacing="-0.01em"
          textAlign={align}
          wordBreak="break-word"
        >
          {text}
        </Heading>
      </Flex>
    </Box>
  );
};

export default HeadingBlock;
